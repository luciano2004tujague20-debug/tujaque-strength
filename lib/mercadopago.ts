import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Inicializa el cliente con tu token (asegurate de tener MP_ACCESS_TOKEN en .env.local)
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

export const mpPreference = new Preference(client);
export const mpPayment = new Payment(client);