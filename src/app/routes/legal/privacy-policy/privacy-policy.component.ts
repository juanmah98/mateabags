import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="legal-page">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-lg-10 col-xl-8">
            <!-- Header -->
            <div class="text-center mb-5">
              <h1 class="legal-title">Política de Privacidad</h1>
              <p class="text-muted">Última actualización: Enero 2026</p>
            </div>

            <!-- Content -->
            <div class="legal-content">
              <!-- Introducción -->
              <section class="legal-section">
                <p class="lead">
                  En <strong>MATEA</strong> nos tomamos muy en serio la privacidad de nuestros usuarios. 
                  Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos 
                  tu información personal de acuerdo con el <strong>Reglamento General de Protección de 
                  Datos (RGPD)</strong> y la legislación española vigente.
                </p>
              </section>

              <!-- Responsable del tratamiento -->
              <section class="legal-section">
                <h2 class="section-title">1. Responsable del Tratamiento</h2>
                <div class="info-card">
                  <div class="info-row">
                    <span class="info-label">Responsable:</span>
                    <span class="info-value">Marina Haddadou Sales</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Nombre comercial:</span>
                    <span class="info-value">MATEA</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">NIF:</span>
                    <span class="info-value">53792630T</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">
                      <a href="mailto:contact.mateabags@gmail.com">contact.mateabags&#64;gmail.com</a>
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Domicilio:</span>
                    <span class="info-value">Carrer Borriana, Castelló, España</span>
                  </div>
                </div>
              </section>

              <!-- Datos que recogemos -->
              <section class="legal-section">
                <h2 class="section-title">2. Datos Personales que Recogemos</h2>
                <p>
                  A través de este sitio web podemos recoger los siguientes tipos de datos personales:
                </p>
                <div class="data-types">
                  <div class="data-type-item">
                    <i class="bi bi-person-fill me-2"></i>
                    <strong>Datos de identificación:</strong> Nombre y apellidos
                  </div>
                  <div class="data-type-item">
                    <i class="bi bi-envelope-fill me-2"></i>
                    <strong>Datos de contacto:</strong> Dirección de correo electrónico, teléfono
                  </div>
                  <div class="data-type-item">
                    <i class="bi bi-geo-alt-fill me-2"></i>
                    <strong>Datos de envío:</strong> Dirección postal completa para entregas
                  </div>
                  <div class="data-type-item">
                    <i class="bi bi-credit-card-fill me-2"></i>
                    <strong>Datos de pago:</strong> Gestionados exclusivamente por Stripe (no almacenamos datos de tarjetas)
                  </div>
                  <div class="data-type-item">
                    <i class="bi bi-graph-up-arrow me-2"></i>
                    <strong>Datos de navegación:</strong> Información recopilada mediante cookies y analítica web
                  </div>
                </div>
                <div class="alert alert-info mt-3">
                  <i class="bi bi-shield-check me-2"></i>
                  <strong>Importante:</strong> Los datos de pago son procesados directamente por Stripe 
                  a través de su plataforma segura. MATEA no almacena ni tiene acceso a la información 
                  completa de tu tarjeta de crédito/débito.
                </div>
              </section>

              <!-- Finalidad del tratamiento -->
              <section class="legal-section">
                <h2 class="section-title">3. Finalidad del Tratamiento</h2>
                <p>Los datos personales se tratan con las siguientes finalidades:</p>
                <ul>
                  <li><strong>Gestión de pedidos:</strong> Procesar tus compras, preventas y gestionar los envíos</li>
                  <li><strong>Acceso anticipado:</strong> Gestionar el acceso a ediciones limitadas y lanzamientos especiales</li>
                  <li><strong>Comunicaciones comerciales:</strong> Enviarte información sobre productos, promociones y novedades de MATEA (solo si has dado tu consentimiento)</li>
                  <li><strong>Analítica web:</strong> Analizar el uso del sitio web para mejorar la experiencia del usuario mediante Google Analytics</li>
                  <li><strong>Atención al cliente:</strong> Responder a tus consultas y gestionar devoluciones o incidencias</li>
                  <li><strong>Cumplimiento legal:</strong> Cumplir con las obligaciones legales aplicables (facturación, contabilidad, etc.)</li>
                </ul>
              </section>

              <!-- Legitimación -->
              <section class="legal-section">
                <h2 class="section-title">4. Base Legal del Tratamiento</h2>
                <p>La base legal para el tratamiento de tus datos personales es:</p>
                <div class="legal-basis">
                  <div class="basis-item">
                    <span class="basis-icon">📝</span>
                    <div>
                      <strong>Consentimiento del usuario</strong>
                      <p>Para el envío de comunicaciones comerciales y uso de cookies no esenciales</p>
                    </div>
                  </div>
                  <div class="basis-item">
                    <span class="basis-icon">🛒</span>
                    <div>
                      <strong>Ejecución de un contrato</strong>
                      <p>Para procesar y gestionar tus pedidos y envíos</p>
                    </div>
                  </div>
                  <div class="basis-item">
                    <span class="basis-icon">⚖️</span>
                    <div>
                      <strong>Cumplimiento de obligaciones legales</strong>
                      <p>Para facturación, contabilidad y otras obligaciones fiscales</p>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Destinatarios -->
              <section class="legal-section">
                <h2 class="section-title">5. Destinatarios de los Datos</h2>
                <p>
                  Para poder prestar nuestros servicios, tus datos podrán ser comunicados a los siguientes 
                  terceros prestadores de servicios:
                </p>
                <ul>
                  <li><strong>Stripe:</strong> Plataforma de procesamiento de pagos (cumple con PCI DSS)</li>
                  <li><strong>Proveedores logísticos:</strong> Empresas de mensajería para la entrega de pedidos</li>
                  <li><strong>Google Analytics:</strong> Herramienta de analítica web (con datos anonimizados)</li>
                  <li><strong>Resend:</strong> Servicio de envío de correos electrónicos transaccionales</li>
                  <li><strong>Firebase / Don Web:</strong> Servicios de hosting y dominio</li>
                </ul>
                <div class="alert alert-warning">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  <strong>Garantía:</strong> En ningún caso vendemos, alquilamos o compartimos tus datos 
                  personales con terceros para fines comerciales ajenos a MATEA.
                </div>
              </section>

              <!-- Derechos del usuario -->
              <section class="legal-section">
                <h2 class="section-title">6. Tus Derechos</h2>
                <p>
                  De acuerdo con la normativa de protección de datos, tienes derecho a ejercer los 
                  siguientes derechos en cualquier momento:
                </p>
                <div class="rights-grid">
                  <div class="right-item">
                    <i class="bi bi-eye-fill"></i>
                    <strong>Acceso</strong>
                    <p>Obtener información sobre qué datos tenemos sobre ti</p>
                  </div>
                  <div class="right-item">
                    <i class="bi bi-pencil-fill"></i>
                    <strong>Rectificación</strong>
                    <p>Corregir datos inexactos o incompletos</p>
                  </div>
                  <div class="right-item">
                    <i class="bi bi-trash-fill"></i>
                    <strong>Supresión</strong>
                    <p>Solicitar la eliminación de tus datos</p>
                  </div>
                  <div class="right-item">
                    <i class="bi bi-hand-thumbs-down-fill"></i>
                    <strong>Oposición</strong>
                    <p>Oponerte al tratamiento de tus datos</p>
                  </div>
                  <div class="right-item">
                    <i class="bi bi-pause-circle-fill"></i>
                    <strong>Limitación</strong>
                    <p>Solicitar la limitación del tratamiento</p>
                  </div>
                  <div class="right-item">
                    <i class="bi bi-box-arrow-right"></i>
                    <strong>Portabilidad</strong>
                    <p>Recibir tus datos en formato estructurado</p>
                  </div>
                </div>
                <p class="mt-4">
                  Para ejercer cualquiera de estos derechos, puedes enviar un correo electrónico a:
                </p>
                <p class="contact-email">
                  <i class="bi bi-envelope-fill me-2"></i>
                  <a href="mailto:contact.mateabags@gmail.com">contact.mateabags&#64;gmail.com</a>
                </p>
                <p class="mt-3">
                  Deberás acompañar tu solicitud con una copia de tu DNI o documento equivalente. 
                  Responderemos a tu solicitud en el plazo máximo de un mes.
                </p>
                <p>
                  También tienes derecho a presentar una reclamación ante la <strong>Agencia Española 
                  de Protección de Datos (AEPD)</strong> si consideras que tus derechos no han sido 
                  atendidos correctamente.
                </p>
              </section>

              <!-- Conservación de datos -->
              <section class="legal-section">
                <h2 class="section-title">7. Conservación de los Datos</h2>
                <p>
                  Los datos personales se conservarán durante el tiempo necesario para cumplir con las 
                  finalidades para las que fueron recogidos:
                </p>
                <ul>
                  <li><strong>Datos de pedidos:</strong> Se conservarán durante el tiempo legalmente establecido para obligaciones fiscales y contables (mínimo 6 años)</li>
                  <li><strong>Datos de marketing:</strong> Hasta que retires tu consentimiento</li>
                  <li><strong>Datos de navegación (cookies):</strong> Según lo especificado en nuestra Política de Cookies</li>
                </ul>
              </section>

              <!-- Seguridad -->
              <section class="legal-section">
                <h2 class="section-title">8. Seguridad de los Datos</h2>
                <p>
                  MATEA ha implementado medidas de seguridad técnicas y organizativas apropiadas para 
                  proteger tus datos personales contra el acceso no autorizado, la pérdida, destrucción 
                  o alteración.
                </p>
                <p>
                  Nuestro sitio web utiliza conexiones seguras HTTPS y todos nuestros proveedores de 
                  servicios cumplen con estándares de seguridad reconocidos internacionalmente.
                </p>
              </section>

              <!-- Más información -->
              <section class="legal-section">
                <h2 class="section-title">9. Contacto</h2>
                <p>
                  Si tienes alguna pregunta sobre esta Política de Privacidad o sobre cómo tratamos 
                  tus datos personales, puedes contactarnos en:
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

    .info-card {
      background: #F7F4EE;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #8B9A8B;
    }

    .info-row {
      display: flex;
      padding: 0.5rem 0;
      border-bottom: 1px solid #E5E0D8;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      font-weight: 600;
      color: #1C352D;
      min-width: 180px;
      flex-shrink: 0;
    }

    .info-value {
      color: #5a645a;
    }

    .data-types {
      margin-top: 1rem;
    }

    .data-type-item {
      background: #F7F4EE;
      padding: 1rem;
      margin-bottom: 0.75rem;
      border-radius: 6px;
      border-left: 3px solid #8B9A8B;
    }

    .legal-basis {
      margin-top: 1rem;
    }

    .basis-item {
      display: flex;
      gap: 1rem;
      background: #F7F4EE;
      padding: 1.25rem;
      margin-bottom: 1rem;
      border-radius: 8px;
    }

    .basis-icon {
      font-size: 2rem;
      flex-shrink: 0;
    }

    .basis-item strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .basis-item p {
      margin-bottom: 0;
      font-size: 0.95rem;
    }

    .rights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .right-item {
      background: #F7F4EE;
      padding: 1.25rem;
      border-radius: 8px;
      text-align: center;
      border-top: 3px solid #8B9A8B;
    }

    .right-item i {
      font-size: 2rem;
      color: #1C352D;
      display: block;
      margin-bottom: 0.75rem;
    }

    .right-item strong {
      display: block;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }

    .right-item p {
      font-size: 0.9rem;
      margin-bottom: 0;
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
      margin-bottom: 0.75rem;
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
      padding: 1rem 1.5rem;
    }

    .alert-info {
      background-color: #e7f3ff;
      color: #004085;
    }

    .alert-warning {
      background-color: #fff3cd;
      color: #856404;
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

      .info-row {
        flex-direction: column;
      }

      .info-label {
        min-width: auto;
        margin-bottom: 0.25rem;
      }

      .rights-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PrivacyPolicyComponent { }
