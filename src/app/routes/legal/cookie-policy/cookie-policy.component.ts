import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="legal-page">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-lg-10 col-xl-8">
            <!-- Header -->
            <div class="text-center mb-5">
              <h1 class="legal-title">Política de Cookies</h1>
              <p class="text-muted">Última actualización: Enero 2026</p>
            </div>

            <!-- Content -->
            <div class="legal-content">
              <!-- Introducción -->
              <section class="legal-section">
                <p class="lead">
                  Este sitio web utiliza cookies propias y de terceros para mejorar la experiencia 
                  del usuario, analizar el tráfico web y ofrecer funcionalidades personalizadas.
                </p>
                <p>
                  Al navegar por <strong>mateabags.com</strong>, aceptas el uso de cookies de acuerdo 
                  con esta política. Puedes aceptar, rechazar o configurar las cookies desde el banner 
                  de configuración que aparece al acceder al sitio web.
                </p>
              </section>

              <!-- ¿Qué son las cookies? -->
              <section class="legal-section">
                <h2 class="section-title">¿Qué son las cookies?</h2>
                <p>
                  Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando 
                  visitas un sitio web. Estas cookies permiten que el sitio web recuerde tus acciones 
                  y preferencias durante un período de tiempo, para que no tengas que volver a configurarlas 
                  cada vez que regreses.
                </p>
              </section>

              <!-- Tipos de cookies utilizadas -->
              <section class="legal-section">
                <h2 class="section-title">Tipos de cookies que utilizamos</h2>
                
                <div class="cookie-type mb-4">
                  <h3 class="cookie-type-title">
                    <i class="bi bi-gear-fill me-2"></i>Cookies técnicas (necesarias)
                  </h3>
                  <p>
                    Son imprescindibles para el correcto funcionamiento del sitio web. Permiten la 
                    navegación básica, el acceso a áreas seguras y la gestión del carrito de compra. 
                    Sin estas cookies, el sitio web no puede funcionar correctamente.
                  </p>
                  <ul>
                    <li>Gestión de sesión de usuario</li>
                    <li>Configuración de preferencias del sitio</li>
                    <li>Seguridad y autenticación</li>
                  </ul>
                </div>

                <div class="cookie-type">
                  <h3 class="cookie-type-title">
                    <i class="bi bi-bar-chart-fill me-2"></i>Cookies analíticas
                  </h3>
                  <p>
                    Utilizamos <strong>Google Analytics</strong> para recopilar información sobre cómo 
                    los usuarios interactúan con nuestro sitio web. Estas cookies nos ayudan a entender 
                    qué páginas son más visitadas, cuánto tiempo permanecen los usuarios en el sitio y 
                    cómo llegaron a nosotros.
                  </p>
                  <p class="mb-2"><strong>Finalidad:</strong></p>
                  <ul>
                    <li>Análisis del tráfico web</li>
                    <li>Medición de la efectividad de campañas</li>
                    <li>Mejora continua de la experiencia de usuario</li>
                    <li>Optimización del contenido y diseño del sitio</li>
                  </ul>
                  <p class="mt-3">
                    <small class="text-muted">
                      <i class="bi bi-info-circle me-1"></i>
                      Google Analytics puede usar cookies persistentes que permanecen en tu dispositivo 
                      hasta 2 años. Puedes obtener más información sobre cómo Google Analytics procesa 
                      estos datos en: 
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">
                        Política de Privacidad de Google
                      </a>
                    </small>
                  </p>
                </div>
              </section>

              <!-- Gestión de cookies -->
              <section class="legal-section">
                <h2 class="section-title">Cómo gestionar las cookies</h2>
                <p>
                  Puedes controlar y/o eliminar las cookies según desees. Puedes eliminar todas las 
                  cookies que ya están en tu dispositivo y configurar la mayoría de los navegadores 
                  para bloquear su instalación.
                </p>

                <div class="alert alert-info">
                  <i class="bi bi-info-circle-fill me-2"></i>
                  <strong>Configuración de cookies en MATEA:</strong> Al acceder a nuestro sitio web 
                  por primera vez, se te mostrará un banner donde podrás aceptar todas las cookies, 
                  rechazar las cookies analíticas o acceder a la configuración detallada.
                </div>

                <h3 class="subsection-title mt-4">Configuración manual desde tu navegador</h3>
                <p>También puedes gestionar las cookies directamente desde la configuración de tu navegador:</p>
                <ul>
                  <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios</li>
                  <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio</li>
                  <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies y datos de sitios web</li>
                  <li><strong>Edge:</strong> Configuración → Privacidad, búsqueda y servicios → Cookies</li>
                </ul>
              </section>

              <!-- Consecuencias de desactivar cookies -->
              <section class="legal-section">
                <h2 class="section-title">Consecuencias de desactivar las cookies</h2>
                <p>
                  Ten en cuenta que, si desactivas las cookies, algunas funcionalidades del sitio web 
                  pueden verse limitadas o no funcionar correctamente. En particular:
                </p>
                <ul>
                  <li>No podrás guardar productos en tu carrito de compra</li>
                  <li>La experiencia de navegación puede no ser óptima</li>
                  <li>Algunas funciones personalizadas pueden no estar disponibles</li>
                </ul>
              </section>

              <!-- Tecnologías utilizadas -->
              <section class="legal-section">
                <h2 class="section-title">Plataformas y tecnologías</h2>
                <p>El sitio web <strong>mateabags.com</strong> utiliza las siguientes tecnologías:</p>
                <ul>
                  <li><strong>Hosting:</strong> Firebase</li>
                  <li><strong>Dominio:</strong> Don Web</li>
                  <li><strong>Analítica web:</strong> Google Analytics</li>
                  <li><strong>Pasarela de pago:</strong> Stripe (cookies necesarias para procesar pagos seguros)</li>
                  <li><strong>Servicio de email:</strong> Resend</li>
                </ul>
              </section>

              <!-- Más información -->
              <section class="legal-section">
                <h2 class="section-title">Más información</h2>
                <p>
                  Si tienes dudas sobre esta política de cookies, puedes contactarnos en:
                </p>
                <p class="contact-email">
                  <i class="bi bi-envelope-fill me-2"></i>
                  <a href="mailto:contact.mateabags@gmail.com">contact.mateabags&#64;gmail.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .legal-page {
      background-color: #F7F4EE;
      min-height: 100vh;
      padding-top: 100px;
      padding-bottom: 60px;
    }

    .legal-title {
      font-family: 'Playfair Display', serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: #1C352D;
      margin-bottom: 0.5rem;
    }

    .legal-content {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }

    .legal-section {
      margin-bottom: 2.5rem;
    }

    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.75rem;
      font-weight: 600;
      color: #1C352D;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #E5E0D8;
    }

    .subsection-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1C352D;
      margin-bottom: 0.75rem;
    }

    .cookie-type {
      background: #F7F4EE;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #8B9A8B;
    }

    .cookie-type-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1C352D;
      margin-bottom: 0.75rem;
    }

    .lead {
      font-size: 1.15rem;
      line-height: 1.7;
      color: #4a4a4a;
      margin-bottom: 1rem;
    }

    p {
      line-height: 1.7;
      color: #5a645a;
      margin-bottom: 1rem;
    }

    ul {
      line-height: 1.8;
      color: #5a645a;
      margin-bottom: 1rem;
    }

    li {
      margin-bottom: 0.5rem;
    }

    strong {
      color: #1C352D;
      font-weight: 600;
    }

    a {
      color: #1C352D;
      text-decoration: underline;
      transition: color 0.2s ease;
    }

    a:hover {
      color: #8B9A8B;
    }

    .contact-email {
      font-size: 1.1rem;
      font-weight: 500;
      color: #1C352D;
    }

    .alert {
      border-radius: 8px;
      border: none;
    }

    .alert-info {
      background-color: #e7f3ff;
      color: #004085;
    }

    @media (max-width: 768px) {
      .legal-page {
        padding-top: 80px;
      }

      .legal-title {
        font-size: 2rem;
      }

      .legal-content {
        padding: 1.5rem;
      }

      .section-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class CookiePolicyComponent { }
