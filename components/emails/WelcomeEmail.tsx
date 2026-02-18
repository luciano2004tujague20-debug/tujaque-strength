import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';

interface WelcomeEmailProps {
  customerName: string;
  planName: string;
}

export const WelcomeEmail = ({ customerName, planName }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Tu acceso a Tujaque Strength está listo.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logo}>TUJAQUE <span style={{color: '#10b981'}}>STRENGTH</span></Text>
        </Section>
        
        <Section style={content}>
          <Heading style={h1}>ACCESO HABILITADO</Heading>
          <Text style={paragraph}>
            Hola <strong>{customerName}</strong>,
          </Text>
          <Text style={paragraph}>
            Tu pago ha sido aprobado correctamente. Ya eres parte oficial del programa <strong>{planName}</strong>.
          </Text>
          <Text style={paragraph}>
            La planificación está cargada y lista para ejecutarse. No esperes resultados sin dolor.
          </Text>

          <Button 
            style={btn} 
            href="https://tujaque-strength.vercel.app/dashboard"
          >
            INGRESAR AL DASHBOARD
          </Button>

          <Hr style={hr} />
          
          <Text style={footer}>
            Recuerda subir tus videos de los levantamientos principales para la corrección biomecánica.
            <br />
            - Luciano Tujague, Head Coach.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

// --- ESTILOS CSS (Diseño Dark Mode para Email) ---
const main = {
  backgroundColor: '#000000',
  fontFamily: 'Helvetica, Arial, sans-serif',
  padding: '40px 0',
};

const container = {
  margin: '0 auto',
  padding: '0 20px',
  maxWidth: '600px',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const logo = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '900',
  fontStyle: 'italic',
  letterSpacing: '-1px',
};

const content = {
  border: '1px solid #333',
  borderRadius: '20px',
  padding: '40px',
  backgroundColor: '#09090b',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '900',
  fontStyle: 'italic',
  textTransform: 'uppercase' as const,
  margin: '0 0 20px',
  letterSpacing: '-1px',
};

const paragraph = {
  color: '#a1a1aa',
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '20px',
};

const btn = {
  backgroundColor: '#10b981',
  borderRadius: '12px',
  color: '#000000',
  fontWeight: '900',
  fontSize: '14px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  textTransform: 'uppercase' as const,
  letterSpacing: '2px',
  marginTop: '20px',
};

const hr = {
  borderColor: '#333',
  margin: '40px 0',
};

const footer = {
  color: '#52525b',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};