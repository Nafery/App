import { Component, OnInit, OnDestroy } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';

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
  selectedDestination: [number, number] | null = null; // Para almacenar las coordenadas del destino
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

  // Modificación en searchAddress para obtener coordenadas
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

  // Modificación en selectSuggestion para usar la ubicación seleccionada y calcular la ruta
  async selectSuggestion(suggestion: any) {
    const [longitude, latitude] = suggestion.geometry.coordinates;
    this.selectedDestination = [longitude, latitude]; // Guardamos las coordenadas del destino

    // Centra el mapa en la nueva ubicación seleccionada
    this.map.flyTo({
      center: [longitude, latitude],
      zoom: 16,
    });

    // Coloca un marcador en el destino seleccionado
    new mapboxgl.Marker({ color: '#ff6347' })
      .setLngLat([longitude, latitude])
      .addTo(this.map);

    // Llama a la función getRoute para trazar la ruta desde la ubicación del usuario al destino
    if (this.userLocation && this.selectedDestination) {
      this.getRoute(this.selectedDestination);
    }

    this.suggestions = []; // Limpia las sugerencias después de la selección
  }

  // Función para obtener la ruta desde la ubicación del usuario hasta el destino
  async getRoute(destination: [number, number]) {
    const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${this.userLocation.join(',')};${destination.join(',')}.json?access_token=${this.mapboxAccessToken}&geometries=geojson`;

    try {
      const response: any = await this.http.get(apiUrl).toPromise();
      console.log('Respuesta de la API:', response);
      if (response.routes && response.routes.length > 0) {
        const route = response.routes[0];
        const routeCoordinates = route.geometry.coordinates;
        console.log('Coordenadas de la ruta:', routeCoordinates);

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
              coordinates: routeCoordinates,
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
      } else {
        console.error('No se encontró una ruta');
      }
    } catch (error) {
      console.error('Error al obtener la ruta:', error);
    }
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
