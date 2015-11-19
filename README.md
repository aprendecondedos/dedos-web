# dedos-web
A través de este proyecto los estudiantes podrán completar las actividades diseñadas por los profesores con DEDOS-Editor en ordenadores, pizarras digitales, tabletas y superficies multicontacto necesitando únicamente acceso a internet.

## Requisitos
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
Editar [config/database.js](../master/config/database.js)

```javascript
module.exports = {
    'url' : 'mongodb://IP:PORT/document'
};
```

### Instalación
```node.js
npm install
```
