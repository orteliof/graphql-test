# Tarea NodeJS
### Requerimientos tecnológicos:
- Javascript  
- NodeJS  
- MongoDB  
- Apollo GraphQL

### Descripción del problema:
 Implementar un servicio en NodeJS utilizando Apollo GraphQL y MongoDB que permita la gestión de roles y permisos.  
Un Rol es un documento que contiene los siguientes campos:  
- id: Cadena de alfanuméricos compatible con un identificador de MongoDB.  
- name: nombre del rol.  
- permissions: arreglo de strings que contiene todos los permisos asociados al rol en cuestión.

Los permisos son cadenas de caracteres que contienen solamente letras mayúsculas,  el carácter de subrayado (**_**) y el carácter para los dos puntos (**:**).  La estructura de la cadena sería la siguiente: `${ENTITY}:${PERMISSION}` donde,  **ENTITY** representa el nombre de la entidad a la que se le está solicitando el permiso y **PERMISSION** es el permiso que se está solicitando. Tanto **ENTITY** como **PERMISSION** están compuesto solamente por letras mayúsculas, en caso que se quiera utilizar  varias palabras para representar los nombres, las mismas se separarán utilizando el carácter de subrayado `(‘_’)` .

### Ejemplos de permisos
> + PROJECT:WRITE  
> + STORE:READ
> + ACCOUNT:READ_ACCESS


El servicio debe contener funcionalidades para soportar las operaciones CRUD básicas. Además, debe soportar las   
siguientes funcionalidades:  

 1. Adicionar permisos a determinado rol (dado el id del rol).  
 2. Adicionar permisos a varios roles (dado un arreglo de ids de roles). 
 3. Eliminar permisos a determinado rol.
 4. Eliminar permisos a varios roles.
 5. Listar roles duplicados. Se considera que un rol es una copia de otro cuando tienen los mismos permisos.

Para realizar las pruebas a los resolvers se puede utilizar el plugin de Chrome, Altair GraphQL Client.

### Bibliotecas que se recomienda utilizar:  
  - **ORM**: Mongoose.  
  - **Manejo de GraphQL**: graphql-composer, graphql-composer-mongoose

___
### Probar del proyecto
Abrir la terminal, clonar el repositorio y moverse a la carpeta **server** e instalar las dependencias.
~~~~ bash
$ git clone https://github.com/orteliof/graphql-test.git
$ cd server
$ npm install
$ npm start
~~~~