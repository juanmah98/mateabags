import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="legal-page">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-lg-10 col-xl-8">
            <!-- Header -->
            <div class="text-center mb-5">
              <h1 class="legal-title">Aviso Legal</h1>
              <p class="text-muted">Última actualización: Enero 2026</p>
            </div>

            <!-- Content -->
            <div class="legal-content">
              <!-- Introducción -->
              <section class="legal-section">
                <p class="lead">
                  En cumplimiento con el deber de información recogido en la <strong>Ley 34/2002 
                  de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE)</strong>, 
                  se informa que el presente sitio web es titularidad de:
                </p>
              </section>

              <!-- Datos identificativos -->
              <section class="legal-section">
                <h2 class="section-title">Datos Identificativos</h2>
                <div class="info-card">
                  <div class="info-row">
                    <span class="info-label">Titular:</span>
                    <span class="info-value">Marina Haddadou Sales</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">NIF:</span>
                    <span class="info-value">53792630T</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Domicilio fiscal:</span>
                    <span class="info-value">Carrer Borriana, Castelló, España</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Correo electrónico:</span>
                    <span class="info-value">
                      <a href="mailto:contact.mateabags@gmail.com">contact.mateabags&#64;gmail.com</a>
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Nombre comercial:</span>
                    <span class="info-value">MATEA</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Dominio web:</span>
                    <span class="info-value">
                      <a href="https://mateabags.com" target="_blank">mateabags.com</a>
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Actividad:</span>
                    <span class="info-value">Trabajadora autónoma - Comercio electrónico</span>
                  </div>
                </div>
              </section>

              <!-- Condiciones de uso -->
              <section class="legal-section">
                <h2 class="section-title">Condiciones de Uso</h2>
                <p>
                  El acceso y uso de este sitio web atribuye la condición de <strong>usuario</strong> 
                  e implica la aceptación plena de las presentes condiciones desde el mismo momento en 
                  que se accede.
                </p>
                <p>
                  El usuario se compromete a hacer un uso adecuado de los contenidos y servicios ofrecidos 
                  a través de este sitio web, y a no emplearlos para:
                </p>
                <ul>
                  <li>Actividades ilícitas, ilegales o contrarias a la buena fe y al orden público</li>
                  <li>Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico-ilegal, 
                      de apología del terrorismo o atentatorio contra los derechos humanos</li>
                  <li>Provocar daños en los sistemas físicos y lógicos del sitio web, de sus proveedores 
                      o de terceros</li>
                  <li>Introducir o difundir virus informáticos o cualesquiera otros sistemas que sean 
                      susceptibles de provocar daños</li>
                  <li>Intentar acceder y, en su caso, utilizar las cuentas de correo electrónico de otros 
                      usuarios y modificar o manipular sus mensajes</li>
                </ul>
                <p>
                  MATEA se reserva el derecho de retirar todos aquellos comentarios y aportaciones que 
                  vulneren el respeto a la dignidad de la persona, que sean discriminatorios, xenófobos, 
                  racistas, pornográficos, que atenten contra la juventud o la infancia, el orden o la 
                  seguridad pública o que, a su juicio, no resultaran adecuados para su publicación.
                </p>
              </section>

              <!-- Propiedad intelectual e industrial -->
              <section class="legal-section">
                <h2 class="section-title">Propiedad Intelectual e Industrial</h2>
                <p>
                  Todos los contenidos del sitio web, incluyendo pero no limitándose a textos, fotografías, 
                  gráficos, imágenes, iconos, tecnología, software, diseño gráfico, código fuente, así como 
                  su diseño gráfico y códigos fuente, constituyen una obra cuya propiedad pertenece a 
                  <strong>MATEA</strong> (Marina Haddadou Sales), sin que puedan entenderse cedidos al usuario 
                  ninguno de los derechos de explotación reconocidos por la normativa vigente en materia de 
                  propiedad intelectual sobre los mismos.
                </p>
                <p>
                  La marca <strong>MATEA</strong>, el logotipo, y demás signos distintivos son titularidad de 
                  Marina Haddadou Sales y están protegidos por la legislación vigente en materia de propiedad 
                  industrial.
                </p>
                <div class="alert alert-warning">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  <strong>Queda prohibida:</strong> La reproducción, distribución, comunicación pública, 
                  transformación o cualquier otra actividad que se pueda realizar con los contenidos del 
                  sitio web sin autorización expresa por escrito de MATEA.
                </div>
              </section>

              <!-- Exclusión de responsabilidad -->
              <section class="legal-section">
                <h2 class="section-title">Exclusión de Responsabilidad</h2>
                
                <h3 class="subsection-title">Contenido del sitio web</h3>
                <p>
                  MATEA no se hace responsable de la información y contenidos almacenados en foros, redes 
                  sociales o cualesquiera otros medios que permitan a terceros publicar contenidos de forma 
                  independiente en el sitio web.
                </p>
                
                <h3 class="subsection-title">Disponibilidad del servicio</h3>
                <p>
                  MATEA no garantiza la disponibilidad y continuidad del funcionamiento del sitio web. 
                  Cuando ello sea razonablemente posible, advertirá previamente las interrupciones en el 
                  funcionamiento del sitio web. MATEA tampoco garantiza la utilidad del sitio web para la 
                  realización de ninguna actividad en particular, ni su infalibilidad.
                </p>
                
                <h3 class="subsection-title">Enlaces externos</h3>
                <p>
                  Las páginas del sitio web podrían contener enlaces a otros sitios de terceros, que MATEA 
                  no puede controlar. Por lo tanto, MATEA no puede asumir responsabilidades por el contenido 
                  que pueda aparecer en páginas de terceros.
                </p>
              </section>

              <!-- Información técnica -->
              <section class="legal-section">
                <h2 class="section-title">Información Técnica</h2>
                <p>Este sitio web utiliza las siguientes tecnologías y servicios:</p>
                <div class="info-card">
                  <div class="info-row">
                    <span class="info-label">Hosting:</span>
                    <span class="info-value">Firebase (Google Cloud Platform)</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Registro de dominio:</span>
                    <span class="info-value">Don Web</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Analítica web:</span>
                    <span class="info-value">Google Analytics</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Pasarela de pago:</span>
                    <span class="info-value">Stripe</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Servicio de email:</span>
                    <span class="info-value">Resend</span>
                  </div>
                </div>
              </section>

              <!-- Legislación aplicable -->
              <section class="legal-section">
                <h2 class="section-title">Legislación Aplicable y Jurisdicción</h2>
                <p>
                  Las presentes condiciones se rigen por la legislación española. Para la resolución de 
                  cualquier controversia que pudiera derivarse del acceso o uso del sitio web, el usuario 
                  y MATEA se someten a los juzgados y tribunales del domicilio del usuario consumidor.
                </p>
              </section>

              <!-- Contacto -->
              <section class="legal-section">
                <h2 class="section-title">Contacto</h2>
                <p>
                  Para cualquier consulta o aclaración sobre este aviso legal, puedes contactarnos en:
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
      margin-top: 1.5rem;
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
      padding: 1rem 1.5rem;
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
    }
  `]
})
export class LegalNoticeComponent { }
