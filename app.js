const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
//Token generado por Facebook Developers
const APP_TOKEN =
  'EAAVIZB5LbIRwBAFdTaQZBTQ600ZA3WEqblu2Pg3ZCbXZClOVnsfZBCX7xsbPP9s5JOQLHnZA6DM9ZClzxOZAV7RHJAQuiQx0XNp7CxLGo8gUGxgwaWCeMexYslDtvDEYA5MXqRiUXLMphTCtPgLJQznyxDJMDu78dWG0GVHkolqtX3QZDZD';

let app = express();

app.use(bodyParser.json());
//Asignación de puerto para levantar server

let PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log('Server listen localhost: 3000');
});

app.get('/', function(req, res) {
  res.send('Abriendo el puerto desde mi pc local');
});

//Configuracion de webhook
app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === 'hello_token') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Tu no tienes que entrar aqui');
  }
});

app.post('/webhook', function(req, res) {
  let data = req.body;
  if (data.object == 'page') {
    data.entry.forEach(function(pageEntry) {
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.message) {
          getMessage(messagingEvent);
        }
      });
    });
  }
  console.log(data);
  res.sendStatus(200);
});

function getMessage(event) {
  let senderID = event.sender.id;
  let messageText = event.message.text;
  senderActions(senderId);
  senderActionsTwo(senderID);
  evaluarMensaje(senderID, messageText);
}

// Evaluar mensaje
function evaluarMensaje(senderID, messageText) {
  let mensaje = '';
  if (isContain(messageText, 'ayuda')) {
    mensaje = 'por el momento no te puedo ayudar :(';
  } else if (isContain(messageText, 'info')) {
    mensaje =
      'Hola que tal nuestro número de teléfono es: 1234-1233\nmi correo es: xxxx@gmail.com';
  } else if (isContain(messageText, 'comparte')) {
    enviarBotonCompartir(senderID);
  } else if (isContain(messageText, 'listar')) {
    enviarLista(senderID);
  } else if (isContain(messageText, 'rapirespuesta')) {
    enviarRespuestaRapida(senderID);
  } else if (isContain(messageText, 'perro')) {
    enviarMensajeImage(senderID);
  } else if (isContain(messageText, 'perfil')) {
    enviarMensajeTemplate(senderID);
  } else if (isContain(messageText, 'hola')) {
    mensaje = 'Hola amigo como estas?';
  } else if (
    isContain(messageText, 'clima') ||
    isContain(messageText, 'temperatura')
  ) {
    getClima(function(_temperatura) {
      enviarMensajeTexto(senderID, getMessageClima(_temperatura));
    });
  } else {
    mensaje = 'solo se repetir las cosas T-T ' + messageText;
  }

  enviarMensajeTexto(senderID, mensaje);
}

// Enviar lista de elementos
function enviarLista(senderID) {
  let messageData = {
    recipient: {
      id: senderID
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'list',
          top_element_style: 'compact',
          elements: [
            {
              title: 'Classic T-Shirt Collection',
              subtitle: 'See all our colors',
              image_url:
                'https://peterssendreceiveapp.ngrok.io/img/collection.png',
              buttons: [
                {
                  title: 'View',
                  type: 'web_url',
                  url: 'https://peterssendreceiveapp.ngrok.io/collection',
                  messenger_extensions: true,
                  webview_height_ratio: 'tall',
                  fallback_url: 'https://peterssendreceiveapp.ngrok.io/'
                }
              ]
            },
            {
              title: 'Classic White T-Shirt',
              subtitle: 'See all our colors',
              default_action: {
                type: 'web_url',
                url: 'https://peterssendreceiveapp.ngrok.io/view?item=100',
                messenger_extensions: false,
                webview_height_ratio: 'tall'
              }
            },
            {
              title: 'Classic Blue T-Shirt',
              image_url:
                'https://peterssendreceiveapp.ngrok.io/img/blue-t-shirt.png',
              subtitle: '100% Cotton, 200% Comfortable',
              default_action: {
                type: 'web_url',
                url: 'https://peterssendreceiveapp.ngrok.io/view?item=101',
                messenger_extensions: true,
                webview_height_ratio: 'tall',
                fallback_url: 'https://peterssendreceiveapp.ngrok.io/'
              },
              buttons: [
                {
                  title: 'Shop Now',
                  type: 'web_url',
                  url: 'https://peterssendreceiveapp.ngrok.io/shop?item=101',
                  messenger_extensions: true,
                  webview_height_ratio: 'tall',
                  fallback_url: 'https://peterssendreceiveapp.ngrok.io/'
                }
              ]
            }
          ],
          buttons: [
            {
              title: 'View More',
              type: 'postback',
              payload: 'payload'
            }
          ]
        }
      }
    }
  };
  callSendAPI(messageData);
}

// Enviar respuestas rapida de elementos
function enviarRespuestaRapida(senderID) {
  let messageData = {
    recipient: {
      id: senderID
    },
    messaging_type: 'RESPONSE',
    message: {
      text: 'Selecciona un color:',
      quick_replies: [
        {
          content_type: 'text',
          title: 'Rojo',
          payload: '<POSTBACK_PAYLOAD>',
          image_url: 'http://example.com/img/red.png'
        },
        {
          content_type: 'text',
          title: 'Verde',
          payload: '<POSTBACK_PAYLOAD>',
          image_url: 'http://example.com/img/green.png'
        }
      ]
    }
  };
  callSendAPI(messageData);
}

// Enviar Button compartir
function enviarBotonCompartir(senderID) {
  let messageData = {
    recipient: {
      id: senderID
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: 'Breaking News: Record Thunderstorms',
              subtitle:
                'The local area is due for record thunderstorms over the weekend.',
              image_url: 'https://thechangreport.com/img/lightning.png',
              buttons: [
                {
                  type: 'element_share',
                  share_contents: {
                    attachment: {
                      type: 'template',
                      payload: {
                        template_type: 'generic',
                        elements: [
                          {
                            title: 'I took the hat quiz',
                            subtitle: 'My result: Fez',
                            image_url:
                              'https://bot.peters-hats.com/img/hats/fez.jpg',
                            default_action: {
                              type: 'web_url',
                              url: 'http://m.me/petershats?ref=invited_by_24601'
                            },
                            buttons: [
                              {
                                type: 'web_url',
                                url:
                                  'http://m.me/petershats?ref=invited_by_24601',
                                title: 'Take Quiz'
                              }
                            ]
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    }
  };
  callSendAPI(messageData);
}

// Enviar Perfil
function enviarMensajeTemplate(senderID) {
  let messageData = {
    recipient: {
      id: senderID
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [elementTemplate(), elementTemplate()]
        }
      }
    }
  };
  callSendAPI(messageData);
}

// Cuerpo de la tarjeta
function elementTemplate() {
  return {
    title: 'Jack',
    subtitle: 'BI Analyst',
    item_url:
      'https://ep01.epimg.net/elpais/imagenes/2018/06/25/buenavida/1529929537_419627_1529933291_noticia_normal_recorte1.jpg',
    image_url:
      'https://ep01.epimg.net/elpais/imagenes/2018/06/25/buenavida/1529929537_419627_1529933291_noticia_normal_recorte1.jpg',
    buttons: [
      buttonTemplate(
        '😀 Contactame',
        'https://ep01.epimg.net/elpais/imagenes/2018/06/25/buenavida/1529929537_419627_1529933291_noticia_normal_recorte1.jpg'
      ),
      buttonTemplate(
        'Portafolio',
        'https://ep01.epimg.net/elpais/imagenes/2018/06/25/buenavida/1529929537_419627_1529933291_noticia_normal_recorte1.jpg'
      )
    ]
  };
}

// Cuerpo del boton
function buttonTemplate(title, url) {
  return {
    type: 'web_url',
    url: url,
    title: title
  };
}

// Enviar Imagen
function enviarMensajeImage(senderID) {
  let messageData = {
    recipient: {
      id: senderID
    },
    message: {
      attachment: {
        type: 'image',
        payload: {
          url:
            'https://ep01.epimg.net/elpais/imagenes/2018/06/25/buenavida/1529929537_419627_1529933291_noticia_normal_recorte1.jpg'
        }
      }
    }
  };
  callSendAPI(messageData);
}

// Enviar Texto plano
function enviarMensajeTexto(senderID, mensaje) {
  let messageData = {
    recipient: {
      id: senderID
    },
    message: {
      text: mensaje
    }
  };
  callSendAPI(messageData);
}

// Formatear el texto de regreso al cliente
function getMessageClima(temperatura) {
  if (temperatura > 30) {
    return (
      'Nos encontramos a ' +
      temperatura +
      '. Hay Demasiado calor, comprate una gaseosa :V'
    );
  } else {
    return (
      'Nos encontramos a ' +
      temperatura +
      ' Grados' +
      '. Es un bonito día para salir'
    );
  }
}

// Enviar texto en temperatura
function getClima(callback) {
  request(
    'http://api.geonames.org/findNearByWeatherJSON?lat=-12.046374&lng=-77.042793&username=eduardo_gpg',
    function(error, response, data) {
      if (!error) {
        let response = JSON.parse(data);
        let temperatura = response.weatherObservation.temperature;
        callback(temperatura);
      } else {
        callback(20); // Temperatura por Defecto
      }
    }
  );
}

// Función para el llamado de la API
function callSendAPI(messageData) {
  request(
    {
      uri: 'https://graph.facebook.com/v4.0/me/messages',
      qs: { access_token: APP_TOKEN },
      method: 'POST',
      json: messageData
    },
    function(error, response, data) {
      if (error) {
        console.log('No es posible enviar el mensaje');
      } else {
        console.log('mensaje enviado');
      }
    }
  );
}

function isContain(texto, word) {
  if (typeof texto == 'undefined' || texto.lenght <= 0) return false;
  return texto.indexOf(word) > -1;
}

function senderActions(senderId) {
  const messageData = {
    recipient: {
      id: senderId
    },
    sender_action: 'mark_seen'
  };
  callSendApi(messageData);
}

function senderActionsTwo(senderId) {
  const messageData = {
    recipient: {
      id: senderId
    },
    sender_action: 'typing_on'
  };
  callSendApi(messageData);
}
