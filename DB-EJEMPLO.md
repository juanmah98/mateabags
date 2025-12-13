{
  "customer": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "María Gómez",
    "email": "maria.gomez@example.com",
    "phone": "+34 600 123 456",
    "stripe_customer_id": null,
    "created_at": "2025-12-12T10:15:00Z"
  },
  "addresses": [
    {
      "id": "a3bb189e-8bf9-3888-9912-ace4e6543002",
      "customer_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "kind": "shipping",
      "label": "Casa",
      "recipient_name": "María Gómez",
      "line1": "Calle Mayor 12",
      "line2": "3ºB",
      "city": "Madrid",
      "state": "Madrid",
      "postcode": "28013",
      "country": "ES",
      "created_at": "2025-12-12T10:15:05Z"
    }
  ],
  "product": {
    "id": "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
    "sku": "SKU-PRIMERO",
    "title": "Producto inicial",
    "description": "Descripción del producto inicial",
    "price": 49.90,
    "currency": "EUR",
    "stock": 100,
    "active": true,
    "created_at": "2025-11-01T09:00:00Z"
  },
  "order": {
    "id": "c9bf9e57-1685-4c89-bafb-ff5af830be8a",
    "customer_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "shipping_address_id": "a3bb189e-8bf9-3888-9912-ace4e6543002",
    "billing_address_id": null,
    "subtotal_amount": 49.90,
    "discount_amount": 0.00,
    "shipping_cost": 5.00,
    "total_amount": 54.90,
    "currency": "EUR",
    "status": "paid",
    "note": "Compra sin cuenta - envío estándar SEUR",
    "created_at": "2025-12-12T10:16:00Z"
  },
  "order_items": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "order_id": "c9bf9e57-1685-4c89-bafb-ff5af830be8a",
      "product_id": "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
      "title": "Producto inicial",
      "sku": "SKU-PRIMERO",
      "quantity": 1,
      "unit_price": 49.90,
      "total_price": 49.90
    }
  ],
  "order_coupons": [],
  "payments": [
    {
      "id": "2f1d3b6a-3f5b-4d2a-9a8b-1f4a6b8d4c9e",
      "order_id": "c9bf9e57-1685-4c89-bafb-ff5af830be8a",
      "amount": 54.90,
      "currency": "EUR",
      "status": "succeeded",
      "stripe_payment_intent_id": "pi_1JH6X2AbcdEfGhIjKlMnOpqr",
      "stripe_checkout_session_id": "cs_test_a1b2c3d4e5f6g7h8",
      "stripe_charge_id": "ch_1JH6X2AbcdEfGhIjKlMnOpqr",
      "payment_method": "card",
      "stripe_raw": {
        "id": "pi_1JH6X2AbcdEfGhIjKlMnOpqr",
        "object": "payment_intent",
        "amount": 5490,
        "currency": "eur",
        "status": "succeeded",
        "charges": {
          "data": [
            {
              "id": "ch_1JH6X2AbcdEfGhIjKlMnOpqr",
              "status": "succeeded",
              "payment_method_details": {
                "card": {
                  "brand": "visa",
                  "last4": "4242"
                }
              }
            }
          ]
        }
      },
      "created_at": "2025-12-12T10:17:10Z"
    }
  ],
  "shipments": [
    {
      "id": "5a8a1f6b-2d4f-4c6e-9a5b-0d2e8f6a7b3c",
      "order_id": "c9bf9e57-1685-4c89-bafb-ff5af830be8a",
      "carrier": "SEUR",
      "service": "standard",
      "tracking_number": null,
      "cost": 5.00,
      "status": "ready",
      "label_url": null,
      "shipped_at": null,
      "delivered_at": null,
      "created_at": "2025-12-12T10:18:00Z"
    }
  ],
  "stripe_events": [
    {
      "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
      "stripe_event_id": "evt_1JH6X2AbcdEfGhIjKlMnOpqr",
      "kind": "payment_intent.succeeded",
      "payload": {
        "id": "evt_1JH6X2AbcdEfGhIjKlMnOpqr",
        "type": "payment_intent.succeeded",
        "data": {
          "object": {
            "id": "pi_1JH6X2AbcdEfGhIjKlMnOpqr",
            "amount": 5490,
            "currency": "eur",
            "status": "succeeded"
          }
        }
      },
      "status": "processed",
      "received_at": "2025-12-12T10:17:12Z"
    }
  ]
}
