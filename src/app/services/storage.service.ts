import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private apiUrl = 'http://127.0.0.1:8000/api/users'; // Reemplaza con la URL de tu API

  constructor(private http: HttpClient) {}

  // Método para obtener datos de la API
  get(key: string): Observable<any> {
    const url = `${this.apiUrl}/get/${key}/`;
    return this.http.get(url);
  }

  // Método para establecer datos en la API
  set(key: string, valor: any): Observable<any> {
    const url = `${this.apiUrl}/set/${key}/`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, { valor }, { headers });
  }

  // Método para borrar datos de la API
  borrar(key: string): Observable<any> {
    const url = `${this.apiUrl}/delete/${key}/`;
    return this.http.delete(url);
  }
}
