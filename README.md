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
Editar [config/database.js](../master/config/database.js)

```javascript
module.exports = {
    'url' : 'mongodb://IP:PORT/document'
};
```

### Instalación
```javascript
npm install
```
### Ejecutar

* Desarrollo

Actualmente se encuentra en fase de desarrollo, para acceder a la página web deberá insertar la siguiente url en su navegador:
http://127.0.0.1:3000

### Licencia
Dedos-web se encuentra bajo la licencia GNU General Public License v3 (GPL-3)
