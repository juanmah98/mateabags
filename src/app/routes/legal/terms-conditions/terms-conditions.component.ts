import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="legal-page">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-lg-10 col-xl-8">
            <!-- Header -->
            <div class="text-center mb-5">
              <h1 class="legal-title">Condiciones Generales de Compra</h1>
              <p class="text-muted">Última actualización: Enero 2026</p>
            </div>

            <!-- Content -->
            <div class="legal-content">
              <!-- Introducción -->
              <section class="legal-section">
                <p class="lead">
                  Las presentes Condiciones Generales regulan la venta de productos físicos de la marca 
                  <strong>MATEA</strong> a través del sitio web <strong>mateabags.com</strong>.
                </p>
                <p>
                  Al realizar un pedido en nuestra tienda online, aceptas expresamente estas condiciones 
                  de compra, así como nuestra Política de Privacidad y nuestro Aviso Legal.
                </p>
              </section>

              <!-- Ámbito de aplicación -->
              <section class="legal-section">
                <h2 class="section-title">1. Ámbito de Aplicación</h2>
                <p>
                  Estas condiciones generales se aplican a todas las compras realizadas a través del 
                  sitio web mateabags.com.
                </p>
                <div class="alert alert-info">
                  <i class="bi bi-info-circle-fill me-2"></i>
                  <strong>Territorio de venta:</strong> Las ventas están limitadas exclusivamente a 
                  <strong>España</strong>. No realizamos envíos internacionales en este momento.
                </div>
                <p>
                  El vendedor es <strong>Marina Haddadou Sales</strong> (MATEA), trabajadora autónoma, 
                  con domicilio fiscal en Carrer Borriana, Castelló, España, NIF: 53792630T.
                </p>
              </section>

              <!-- Productos -->
              <section class="legal-section">
                <h2 class="section-title">2. Productos</h2>
                <p>
                  <strong>MATEA</strong> comercializa productos de edición limitada, incluyendo 
                  lanzamientos especiales como la edición <strong>ORIGIN</strong>.
                </p>
                <p>
                  Las imágenes mostradas en el sitio web son orientativas y pueden presentar ligeras 
                  variaciones propias de:
                </p>
                <ul>
                  <li>Procesos artesanales de fabricación</li>
                  <li>Características inherentes a producciones limitadas</li>
                  <li>Variaciones en la calibración de pantallas</li>
                </ul>
                <p>
                  Cada producto incluye una descripción detallada con sus características principales, 
                  materiales y especificaciones técnicas.
                </p>
              </section>

              <!-- Proceso de compra y preventa -->
              <section class="legal-section">
                <h2 class="section-title">3. Proceso de Compra y Preventa</h2>
                <p>
                  Para realizar una compra, debes seguir estos pasos:
                </p>
                <ol>
                  <li>Seleccionar el producto y la cantidad deseada</li>
                  <li>Añadir al carrito y proceder al checkout</li>
                  <li>Completar los datos de envío y facturación</li>
                  <li>Realizar el pago a través de la pasarela segura de Stripe</li>
                  <li>Recibir confirmación del pedido por email</li>
                </ol>
                
                <h3 class="subsection-title">Preventas y acceso anticipado</h3>
                <p>
                  Algunos productos pueden ofrecerse en modalidad de <strong>preventa</strong> o 
                  <strong>acceso anticipado</strong> antes de su lanzamiento oficial.
                </p>
                <div class="alert alert-warning">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  <strong>Importante:</strong> Al realizar una compra en preventa, el usuario acepta 
                  expresamente los plazos de preparación y envío indicados en la descripción del producto, 
                  que pueden ser superiores a los plazos estándar.
                </div>
              </section>

              <!-- Precios y pago -->
              <section class="legal-section">
                <h2 class="section-title">4. Precios y Pago</h2>
                
                <h3 class="subsection-title">Precios</h3>
                <p>
                  Los precios de nuestros productos:
                </p>
                <ul>
                  <li>Se expresan en <strong>euros (€)</strong></li>
                  <li>Incluyen el <strong>IVA</strong> y demás impuestos aplicables</li>
                  <li>No incluyen gastos de envío (se informan antes de finalizar la compra)</li>
                  <li>Pueden modificarse sin previo aviso, aplicándose el precio vigente en el momento de la compra</li>
                </ul>
                
                <h3 class="subsection-title">Métodos de pago</h3>
                <p>
                  Los pagos se procesan de forma segura a través de <strong>Stripe</strong>, una plataforma 
                  de procesamiento de pagos certificada internacionalmente.
                </p>
                <p>
                  Métodos de pago aceptados:
                </p>
                <ul>
                  <li>Tarjetas de crédito (Visa, Mastercard, American Express)</li>
                  <li>Tarjetas de débito</li>
                  <li>Otros métodos disponibles a través de Stripe</li>
                </ul>
                <div class="info-card mt-3">
                  <i class="bi bi-shield-check text-success fs-3 me-2"></i>
                  <div>
                    <strong>Seguridad en los pagos:</strong>
                    <p class="mb-0 mt-2">
                      MATEA no almacena ni tiene acceso a los datos completos de tu tarjeta. Toda la 
                      información de pago es gestionada directamente por Stripe bajo los más altos 
                      estándares de seguridad (PCI DSS Level 1).
                    </p>
                  </div>
                </div>
              </section>

              <!-- Envíos -->
              <section class="legal-section">
                <h2 class="section-title">5. Envíos</h2>
                
                <div class="shipping-info">
                  <div class="shipping-item">
                    <i class="bi bi-box-seam"></i>
                    <strong>Preparación del producto</strong>
                    <p>Hasta 48 horas laborables</p>
                  </div>
                  <div class="shipping-item">
                    <i class="bi bi-truck"></i>
                    <strong>Plazo de envío</strong>
                    <p>Hasta 5 días laborables desde la preparación</p>
                  </div>
                  <div class="shipping-item">
                    <i class="bi bi-geo-alt"></i>
                    <strong>Territorio</strong>
                    <p>Solo envíos a España (Península y Baleares)</p>
                  </div>
                </div>

                <p class="mt-4">
                  Los plazos de envío indicados son estimados y pueden variar en:
                </p>
                <ul>
                  <li>Periodos de preventa o alta demanda</li>
                  <li>Festivos nacionales o regionales</li>
                  <li>Circunstancias excepcionales de fuerza mayor</li>
                </ul>
                <p>
                  Una vez realizado el envío, recibirás un email con el número de seguimiento para 
                  que puedas rastrear tu pedido.
                </p>
              </section>

              <!-- Derecho de desistimiento -->
              <section class="legal-section">
                <h2 class="section-title">6. Derecho de Desistimiento y Devoluciones</h2>
                
                <p>
                  De acuerdo con la legislación española sobre protección de consumidores, dispones de 
                  <strong>14 días naturales</strong> desde la recepción del producto para ejercer tu 
                  derecho de desistimiento sin necesidad de justificación.
                </p>

                <h3 class="subsection-title">Condiciones para devoluciones</h3>
                <div class="conditions-list">
                  <div class="condition-item">
                    <i class="bi bi-check-circle-fill text-success"></i>
                    <span>El producto debe devolverse en <strong>perfecto estado</strong></span>
                  </div>
                  <div class="condition-item">
                    <i class="bi bi-check-circle-fill text-success"></i>
                    <span>Sin uso, con todas sus etiquetas y en su embalaje original</span>
                  </div>
                  <div class="condition-item">
                    <i class="bi bi-check-circle-fill text-success"></i>
                    <span>Acompañado de la factura de compra original</span>
                  </div>
                  <div class="condition-item">
                    <i class="bi bi-x-circle-fill text-danger"></i>
                    <span>Los <strong>gastos de envío de la devolución</strong> corren a cargo del cliente</span>
                  </div>
                </div>

                <h3 class="subsection-title mt-4">Proceso de devolución</h3>
                <ol>
                  <li>Envía un email a <a href="mailto:contact.mateabags@gmail.com">contact.mateabags&#64;gmail.com</a> 
                      indicando el número de pedido y el motivo de la devolución</li>
                  <li>Espera nuestra confirmación con las instrucciones de devolución</li>
                  <li>Empaqueta cuidadosamente el producto y envíalo a la dirección indicada</li>
                  <li>Una vez recibido y verificado el estado del producto, te reembolsaremos el importe</li>
                </ol>

                <div class="alert alert-info mt-3">
                  <i class="bi bi-info-circle-fill me-2"></i>
                  <strong>Reembolso:</strong> En productos de edición limitada, el reembolso se realizará 
                  una vez comprobado el estado del producto. El plazo máximo es de 14 días desde la recepción 
                  de la devolución. El reembolso se realizará por el mismo método de pago utilizado en la compra.
                </div>
              </section>

              <!-- Garantías -->
              <section class="legal-section">
                <h2 class="section-title">7. Garantías</h2>
                <p>
                  Todos nuestros productos cuentan con la <strong>garantía legal de conformidad</strong> 
                  de 2 años establecida por la legislación española.
                </p>
                <p>
                  Esta garantía cubre:
                </p>
                <ul>
                  <li>Defectos de fabricación</li>
                  <li>Falta de conformidad con la descripción del producto</li>
                  <li>Problemas de calidad o materiales</li>
                </ul>
                <p>
                  Para hacer efectiva la garantía, contacta con nosotros en 
                  <a href="mailto:contact.mateabags@gmail.com">contact.mateabags&#64;gmail.com</a> 
                  acompañando fotografías del defecto y tu número de pedido.
                </p>
              </section>

              <!-- Responsabilidad -->
              <section class="legal-section">
                <h2 class="section-title">8. Limitación de Responsabilidad</h2>
                <p>
                  MATEA se compromete a ofrecer productos de la máxima calidad y un servicio de entrega 
                  profesional. No obstante:
                </p>
                <ul>
                  <li>MATEA no se responsabiliza de retrasos derivados de causas ajenas a su control 
                      (logística, condiciones meteorológicas, fuerza mayor, etc.)</li>
                  <li>El cliente debe verificar el estado del paquete en el momento de la entrega y hacer 
                      constar cualquier anomalía en el albarán del transportista</li>
                  <li>No nos hacemos responsables de direcciones de entrega incorrectas proporcionadas 
                      por el cliente</li>
                </ul>
              </section>

              <!-- Protección de datos -->
              <section class="legal-section">
                <h2 class="section-title">9. Protección de Datos</h2>
                <p>
                  Los datos personales facilitados durante el proceso de compra serán tratados de acuerdo 
                  con nuestra <a href="/privacy-policy">Política de Privacidad</a> y la normativa vigente 
                  en materia de protección de datos (RGPD y LOPDGDD).
                </p>
              </section>

              <!-- Legislación aplicable -->
              <section class="legal-section">
                <h2 class="section-title">10. Legislación Aplicable y Jurisdicción</h2>
                <p>
                  Estas Condiciones Generales se rigen por la legislación española.
                </p>
                <p>
                  Para la resolución de cualquier controversia derivada de la compra, el consumidor y 
                  MATEA, con renuncia expresa a cualquier otro fuero, se someten a los juzgados y tribunales 
                  del domicilio del consumidor.
                </p>
              </section>

              <!-- Contacto -->
              <section class="legal-section">
                <h2 class="section-title">11. Contacto</h2>
                <p>
                  Para cualquier duda o consulta sobre estas Condiciones Generales de Compra, puedes 
                  contactarnos en:
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
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .shipping-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .shipping-item {
      background: #F7F4EE;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
      border-top: 3px solid #8B9A8B;
    }

    .shipping-item i {
      font-size: 2.5rem;
      color: #1C352D;
      display: block;
      margin-bottom: 1rem;
    }

    .shipping-item strong {
      display: block;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      color: #1C352D;
    }

    .shipping-item p {
      margin-bottom: 0;
      font-size: 0.95rem;
    }

    .conditions-list {
      margin: 1.5rem 0;
    }

    .condition-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      margin-bottom: 0.75rem;
      background: #F7F4EE;
      border-radius: 6px;
    }

    .condition-item i {
      font-size: 1.25rem;
      flex-shrink: 0;
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

    ul, ol {
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

      .shipping-info {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TermsConditionsComponent { }
