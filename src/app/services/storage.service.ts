import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private bdd: Storage = new Storage();
  private bddCheck: Promise<void>;

  constructor(private storage: Storage) { 
    this.bddCheck = this.onInit();
  }
  
  async onInit(): Promise<void> {
    const storage = await this.storage.create();
    this.bdd = storage;
  }

  async bddConectada():Promise<void> {
    await this.bddCheck;
  }

  async get(key: string): Promise<any> {
    await this.bddConectada();
    return this.bdd.get(key);
  }

  async set(key: string, valor: any) {
    await this.bddConectada();
    this.bdd.set(key, valor);
    console.log('Actualizado con exito');
  }

  async borrar(key: string) {

  }
}
