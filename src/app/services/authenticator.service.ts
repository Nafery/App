import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatorService {
  private apiUrl = 'https://n43kt17h-8000.brs.devtunnels.ms/api/users/'; // Reemplaza con la URL de tu API
  private connectionStatus = false;
  private currentUser: string | null = null;

  constructor(private http: HttpClient) {}

  // Método para autenticar al usuario
  login(username: string, password: string): Observable<any> {
    const url = `${this.apiUrl}?username=${username}`;
    return this.http.get(url);
  }

  // Método para registrar un nuevo usuario
  register(user: any): Observable<any> {
    const url = `${this.apiUrl}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, user, { headers });
  }

  // Método para obtener la lista de usuarios
  getUsers(): Observable<any> {
    const url = `${this.apiUrl}`;
    return this.http.get(url);
  }

  // Método para actualizar un usuario
  updateUser(user: any): Observable<any> {
    const url = `${this.apiUrl}${user.id}/`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, user, { headers });
  }

  // Método para eliminar un usuario
  deleteUser(userId: number): Observable<any> {
    const url = `${this.apiUrl}${userId}/`;
    return this.http.delete(url);
  }

  // Método para cerrar sesión
  logout(): void {
    this.connectionStatus = false;
    this.currentUser = null;
  }

  // Método para verificar el estado de conexión
  isConnected(): boolean {
    return this.connectionStatus;
  }

  // Método para obtener el usuario conectado
  getCurrentUser(): string | null {
    return this.currentUser;
  }

  // Método para establecer el estado de conexión y el usuario actual
  setConnectionStatus(status: boolean, user: string | null): void {
    this.connectionStatus = status;
    this.currentUser = user;
  }
}