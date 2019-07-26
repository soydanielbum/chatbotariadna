const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
//Token generado por Facebook Developers
const APP_TOKEN =
  'EAAVIZB5LbIRwBAAg7u1aZAlXWmzHOsyahS5hYM2GDJdlPkxtZB7eGZAopwoOZATqRbZCyqasCl2qXHwdiHOGfwHZBCFMKZBLoYrak9YfZBEcGoqEzYkHx8NywIXJJUf2pHVQ1tZAdka9V3QYShypE7TuXplcjpfQOGHCUQhjevl948YAZDZD';

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
  } else if (isContain(messageText, 'perro')) {
    enviarMensajeImage(senderID);
  } else if (isContain(messageText, 'daniel')) {
    enviarMensajeTemplate(senderID);
  } else if (isContain(messageText, 'hola')) {
    mensaje = 'Hola {{first name}} amigo como estas?';
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

// Enviar Perfil
function enviarMensajeTemplate(senderID) {
  var messageData = {
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
    title: 'Daniel Cardona Olaya',
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
        callback(15); // Temperatura por Defecto
      }
    }
  );
}

// Función para el llamado de la API
function callSendAPI(messageData) {
  request(
    {
      uri: 'https://graph.facebook.com/v3.3/me/messages',
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
