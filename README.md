# dedos-web
![Dedos banner](http://i.imgur.com/xRJ1hf9.png)

A través de este proyecto los estudiantes podrán completar las actividades diseñadas por los profesores con DEDOS-Editor en ordenadores, pizarras digitales, tabletas y superficies multicontacto necesitando únicamente acceso a internet.

## Requisitos
Dedos-web requiere las siguientes tecnologías para su instalación:
* [node.js](https://github.com/nodejs/node)
* [npm - Package manager](https://github.com/npm/npm)
* [MongoDB](https://www.mongodb.org/)

### Librerias Node.js
* [xml2js](https://www.npmjs.com/package/xml2js)
* [adm-zip](https://www.npmjs.com/package/adm-zip)
* [mongoose](https://www.npmjs.com/package/mongoose)
* [nunjucks](https://www.npmjs.com/package/nunjucks)
* [multer](https://www.npmjs.com/package/multer)

### Configuración
Renombrar [config/env/env.example.json](../master/config/env/env.example.json) a ``` env.json ```

Editar el archivo
```javascript
{
  "DATABASE_SERVER": "127.0.0.1:27017", // Servidor y puerto de MongoDB
  "DATABASE_TABLE": "dedos", // Document de MongoDB
  "MAILER_MANDRILL_APIKEY": "API_KEY", // API key de Mandrill para envio de correo
  "FACEBOOK_CLIENTID": "ID",
  "FACEBOOK_SECRET": "SECRET",
  "TWITTER_CLIENTID": "ID",
  "TWITTER_SECRET": "SECRET",
  "GITHUB_CLIENTID": "ID",
  "GITHUB_SECRET": "SECRET",
  "LINKEDIN_CLIENTID": "ID",
  "LINKEDIN_SECRET": "SECRET",
  "GOOGLE_CLIENTID": "ID",
  "GOOGLE_SECRET": "SECRET"
}
```

### Instalación
```sh
npm install
```
### Ejecutar

* Desarrollo

Actualmente se encuentra en fase de desarrollo, para acceder a la página web deberá insertar la siguiente url en su navegador:
http://127.0.0.1:3000

### Licencia
Dedos-web se encuentra bajo la licencia GNU General Public License v3 (GPL-3)
