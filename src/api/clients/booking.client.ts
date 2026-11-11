import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Booking } from '../models/booking.js';
export type HttpExchange = {
  method: string; path: string; requestBody?: unknown; status?: number;
  durationMs: number; responseBody?: string; error?: string;
};
// Nunca registrar cabeceras ni /auth: el token no forma parte del historial de negocio.
export class BookingClient {
  constructor(private readonly http: APIRequestContext, private readonly token: string, private readonly record: (exchange: HttpExchange) => void = () => {}) {}
  private async send(method: string, path: string, requestBody: unknown, action: () => Promise<APIResponse>) {
    const started = Date.now();
    try {
      const response = await action();
      const responseBody = (await response.text()).replaceAll(this.token, '[TOKEN OCULTO]').slice(0, 12000);
      this.record({method, path, requestBody, status: response.status(), durationMs: Date.now() - started, responseBody});
      return response;
    } catch (error) {
      const message = String(error).replaceAll(this.token, '[TOKEN OCULTO]');
      this.record({method, path, requestBody, durationMs: Date.now() - started, error: message});
      throw new Error(message);
    }
  }
  create(booking: Partial<Booking>) { return this.send('POST', '/booking', booking, () => this.http.post('/booking', {data: booking})); }
  findById(id: number) { const path = '/booking/' + id; return this.send('GET', path, undefined, () => this.http.get(path)); }
  list(filters: {firstname?: string; lastname?: string} = {}) { return this.send('GET', '/booking', filters, () => this.http.get('/booking', {params: filters})); }
  update(id: number, booking: Booking, authorized = true) {
    const path = '/booking/' + id;
    return this.send('PUT', path, booking, () => this.http.put(path, {data: booking, headers: authorized ? {Cookie: 'token=' + this.token} : {}}));
  }
  patch(id: number, changes: Partial<Booking>) {
    const path = '/booking/' + id;
    return this.send('PATCH', path, changes, () => this.http.patch(path, {data: changes, headers: {Cookie: 'token=' + this.token}}));
  }
  remove(id: number) { const path = '/booking/' + id; return this.send('DELETE', path, undefined, () => this.http.delete(path, {headers: {Cookie: 'token=' + this.token}})); }
}
