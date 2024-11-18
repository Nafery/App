import { Component, OnInit, OnDestroy } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { HttpClient } from '@angular/common/http';
import { debounceTime, Subject } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { Location } from '@angular/common';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit, OnDestroy {
  map!: mapboxgl.Map;
  userMarker!: mapboxgl.Marker;
  destinationMarker!: mapboxgl.Marker;
  watchId!: number;
  routeCoordinates: [number, number][] = [];
  directionsUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving';
  geocodingUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  searchQuery: string = '';
  suggestions: any[] = [];
  userLocation: [number, number] = [0, 0];
  useCapacitorGeolocation: boolean = false;

  // Nueva propiedad para almacenar la distancia y duración
  distance: string | null = null;
  duration: string | null = null;

  // Observable para manejar el debounce
  searchSubject = new Subject<string>();

  constructor(private http: HttpClient) {
    // Configurar el debounce para la búsqueda
    this.searchSubject.pipe(debounceTime(300)).subscribe((query) => {
      this.performSearch(query);
    });
  }

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
    // Intentar obtener la ubicación con la API nativa del navegador
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = [position.coords.longitude, position.coords.latitude];
          this.initializeMap();
        },
        async (error) => {
          console.warn('Navigator geolocation no funcionó, intentando con Capacitor...', error);
          this.useCapacitorGeolocation = true;
          await this.getCapacitorLocation();
        }
      );
    } else {
      console.error('Geolocalización no es soportada por este navegador, usando Capacitor.');
      this.useCapacitorGeolocation = true;
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
    (mapboxgl as any).accessToken = 'pk.eyJ1IjoibmFmZXJ5aCIsImEiOiJjbTM4dzltZnAwd2drMmlwc3JsMHB2d3R5In0.nqIQG-qiDGgSJJdX-LLg_A';

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.userLocation,
      zoom: 12,
    });

    // Añadir un marcador en la ubicación actual del usuario
    this.userMarker = new mapboxgl.Marker({ color: 'blue' })
      .setLngLat(this.userLocation)
      .addTo(this.map);
  }

  initializeDefaultMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40], // Coordenadas predeterminadas
      zoom: 9,
    });
  }

  // Método para manejar el input y aplicar debounce
  onSearchChange(event: any) {
    const query = event.target.value;
    this.searchSubject.next(query);
  }

  // Método para realizar la búsqueda con autocompletado
  performSearch(query: string) {
    if (query.trim().length > 0) {
      const url = `${this.geocodingUrl}/${encodeURIComponent(query)}.json?access_token=${(mapboxgl as any).accessToken}&autocomplete=true&limit=5`;

      this.http.get(url).subscribe(
        (response: any) => {
          this.suggestions = response.features;
        },
        (error) => {
          console.error('Error en la búsqueda de direcciones:', error);
        }
      );
    } else {
      this.suggestions = [];
    }
  }

  // Método para seleccionar una sugerencia de autocompletado
  selectSuggestion(suggestion: any) {
    const coordinates = suggestion.geometry.coordinates;
    const destination: [number, number] = [coordinates[0], coordinates[1]];

    // Centrar el mapa en la dirección seleccionada
    this.map.flyTo({ center: destination, zoom: 14 });

    // Añadir un marcador en el destino seleccionado
    if (this.destinationMarker) {
      this.destinationMarker.setLngLat(destination);
    } else {
      this.destinationMarker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat(destination)
        .addTo(this.map);
    }

    // Crear la ruta desde la ubicación actual hasta la dirección seleccionada
    this.getRoute(this.userLocation, destination);

    // Limpiar el input y las sugerencias
    this.searchQuery = suggestion.place_name;
    this.suggestions = [];
  }

  getRoute(start: [number, number], end: [number, number]) {
    const url = `${this.directionsUrl}/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${(mapboxgl as any).accessToken}`;

    this.http.get(url).subscribe(
      (response: any) => {
        const route = response.routes[0].geometry.coordinates;
        const distance = response.routes[0].distance; // en metros
        const duration = response.routes[0].duration; // en segundos

        // Almacenar la distancia y duración para usarlos en la vista
        this.distance = (distance / 1000).toFixed(2); // Convertir metros a kilómetros
        this.duration = (duration / 60).toFixed(2);   // Convertir segundos a minutos

        // Llamar al método para dibujar la ruta en el mapa
        this.drawRoute(route);
      },
      (error) => {
        console.error('Error obteniendo la ruta:', error);
      }
    );
  }

  drawRoute(coordinates: [number, number][]) {
    const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: coordinates,
      },
    };

    if (this.map.getSource('route')) {
      (this.map.getSource('route') as mapboxgl.GeoJSONSource).setData(geojson);
    } else {
      this.map.addSource('route', {
        type: 'geojson',
        data: geojson,
      });

      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#007aff',
          'line-width': 4,
        },
      });
    }
  }
}
