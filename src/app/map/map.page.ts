import { Component, OnInit, OnDestroy } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';

interface Route {
  geometry: {
    coordinates: [number, number][];
  };
  distance: number;
  duration: number;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit, OnDestroy {
  map!: mapboxgl.Map;
  userMarker!: mapboxgl.Marker;
  userLocation: [number, number] = [0, 0];
  watchId!: number;
  searchQuery: string = '';
  suggestions: any[] = [];
  selectedDestination: [number, number] | null = null;
  distance: string = '';
  duration: string = '';
  cost: string = ''; // Variable para mostrar el costo
  private destinationMarker?: mapboxgl.Marker;

  private mapboxAccessToken = 'pk.eyJ1IjoibmFmZXJ5aCIsImEiOiJjbTM4dzltZnAwd2drMmlwc3JsMHB2d3R5In0.nqIQG-qiDGgSJJdX-LLg_A';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.checkGeolocation();
  }

  ngOnDestroy(): void {
    if (navigator.geolocation && this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  async checkGeolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = [position.coords.longitude, position.coords.latitude];
          this.initializeMap();
        },
        async (error) => {
          console.warn('Navigator geolocation no funcionó, intentando con Capacitor...', error);
          await this.getCapacitorLocation();
        }
      );
    } else {
      console.error('Geolocalización no es soportada por este navegador, usando Capacitor.');
      await this.getCapacitorLocation();
    }
  }

  async getCapacitorLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.userLocation = [position.coords.longitude, position.coords.latitude];
      this.initializeMap();
    } catch (error) {
      console.error('Error obteniendo la ubicación con Capacitor:', error);
      this.initializeDefaultMap();
    }
  }

  initializeMap() {
    (mapboxgl as any).accessToken = this.mapboxAccessToken;

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.userLocation,
      zoom: 16,
    });

    this.userMarker = new mapboxgl.Marker({
      color: '#007aff',
      draggable: false,
      element: this.createPuckElement(),
    })
    .setLngLat(this.userLocation)
    .addTo(this.map);

    this.map.on('load', () => {
      console.log('Mapa cargado');
    });
  }

  createPuckElement(): HTMLElement {
    const puck = document.createElement('div');
    puck.style.width = '20px';
    puck.style.height = '20px';
    puck.style.backgroundColor = '#007aff';
    puck.style.borderRadius = '50%';
    puck.style.border = '2px solid white';
    puck.style.transform = 'translate(-50%, -50%)';
    return puck;
  }

  async searchAddress() {
    const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(this.searchQuery)}.json?access_token=${this.mapboxAccessToken}`;
    try {
      const response: any = await this.http.get(apiUrl).toPromise();
      if (response.features && response.features.length > 0) {
        this.suggestions = response.features;
      } else {
        this.suggestions = [];
      }
    } catch (error) {
      console.error('Error al buscar la dirección:', error);
    }
  }

  async selectSuggestion(suggestion: any) {
    const [longitude, latitude] = suggestion.geometry.coordinates;
    this.selectedDestination = [longitude, latitude];
  
    // Elimina el marcador de destino anterior si existe
    if (this.destinationMarker) {
      this.destinationMarker.remove();
    }
  
    // Crea un nuevo marcador de destino y guárdalo en la variable
    this.destinationMarker = new mapboxgl.Marker({ color: '#ff6347' })
      .setLngLat([longitude, latitude])
      .addTo(this.map);
  
    this.map.flyTo({
      center: [longitude, latitude],
      zoom: 16,
    });
  
    if (this.userLocation && this.selectedDestination) {
      this.getRoute(this.selectedDestination);
    }
  
    this.suggestions = [];
  }
  

  async getRoute(destination: [number, number]) {
    const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${this.userLocation.join(',')};${destination.join(',')}.json?access_token=${this.mapboxAccessToken}&geometries=geojson&alternatives=true`;

    try {
      const response: any = await this.http.get(apiUrl).toPromise();
      console.log('Respuesta de la API:', response);

      if (response.routes && response.routes.length > 0) {
        const routes: Route[] = response.routes;
        const routeCoordinates = routes.map(route => route.geometry.coordinates);
        const distances = routes.map(route => route.distance);
        const durations = routes.map(route => route.duration);

        // Encontrar la mejor ruta (ejemplo simple: la de menor duración)
        const bestRouteIndex = durations.indexOf(Math.min(...durations));

        // Calcular y mostrar la mejor ruta
        this.distance = `${(distances[bestRouteIndex] / 1000).toFixed(2)} km`;
        this.duration = this.formatDuration(durations[bestRouteIndex]);
        this.cost = this.calculateRouteCost(distances[bestRouteIndex], durations[bestRouteIndex]); // Calcular el costo

        if (this.map.getSource('route')) {
          this.map.removeSource('route');
        }
        if (this.map.getLayer('route')) {
          this.map.removeLayer('route');
        }

        this.map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates[bestRouteIndex],
            },
            properties: {},
          },
        });

        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#007aff',
            'line-width': 4,
          },
        });

        // Agregar rutas alternativas
        routes.forEach((route, index) => {
          if (index !== bestRouteIndex) {
            this.map.addSource(`route-${index}`, {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: route.geometry.coordinates,
                },
                properties: {
                  routeIndex: index,
                },
              },
            });

            this.map.addLayer({
              id: `route-${index}`,
              type: 'line',
              source: `route-${index}`,
              layout: {
                'line-cap': 'round',
                'line-join': 'round',
              },
              paint: {
                'line-color': '#ff6347',
                'line-width': 2,
                'line-dasharray': [2, 2],
              },
            });
          }
        });
      } else {
        console.error('No se encontró una ruta');
      }
    } catch (error) {
      console.error('Error al obtener la ruta:', error);
    }
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} h ${minutes} min`;
    }
    return `${minutes} min`;
  }

  // Función para calcular el costo del viaje y redondearlo como número entero
  calculateRouteCost(distance: number, duration: number): string {
    const costPerKm = 400; // Costo por km (puedes ajustar este valor)
    const costPerMinute = 250; // Costo por minuto (puedes ajustar este valor)

    const cost = (distance / 1000) * costPerKm + (duration / 60) * costPerMinute;
    const roundedCost = Math.round(cost); // Redondear el costo a un número entero
    return `$${roundedCost}`;
  }

  cancelRoute() {
    // Remover la capa y la fuente de la ruta actual
    if (this.map.getSource('route')) {
      this.map.removeSource('route');
    }
    if (this.map.getLayer('route')) {
      this.map.removeLayer('route');
    }

    // Remover las capas y fuentes de rutas alternativas
    let index = 0;
    while (this.map.getLayer(`route-${index}`)) {
      this.map.removeLayer(`route-${index}`);
      this.map.removeSource(`route-${index}`);
      index++;
    }

    // Limpiar los datos de distancia, duración y costo
    this.distance = '';
    this.duration = '';
    this.cost = '';
  }

  initializeDefaultMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40],
      zoom: 12,
    });
  }

  centerOnUserLocation() {
    if (this.map && this.userLocation[0] !== 0 && this.userLocation[1] !== 0) {
      this.map.flyTo({
        center: this.userLocation,
        zoom: 16,
      });
    } else {
      console.warn('La ubicación del usuario no está disponible');
    }
  }
}
