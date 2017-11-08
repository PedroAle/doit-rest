# DoIt API Documentation
## Endpoints activos
### Host: https://doit-api.herokuapp.com/


| Accion        | Endpoint      | HTTP method| Content Type |
| ------------- |:-------------:|:----------:|:----------:|
| Crear Usuario          |  ``/users``          | POST| JSON|
| Login          |  ``/login``          | POST| JSON|

## Detalles y ejemplos de uso

**Crear usuario**
Se debe hacer un POST a ```/users``` con un archivo que contenga los siguientes datos:
 ```
 {
	"nombre": "Name",
	"apellido": "LastName",
	"fechaDeNacimiento": "1990-10-27",
	"password": "Password",
	"formaDeRegistro": 1,
	"username": "Test"
}

 ```
 *  **Atributos**
     * *Nombre y Apellido:*  3 a 50 caracteres (solo letras)
     * *Fecha de nacimiento:* verifica que sea mayor de edad
     * *Password:* debe tener entre 7 y 50 caracteres. Lo que reciba el servidor sera encriptado
     * *Forma de registro:* Web App: 1 - Android App: 2
     * *Username:* identificador unico en el sistema, de 3 a 50 caracteres alfanumericos
     * *Activo:* booleano que indica si la cuenta esta activa o no. ``default: true``




 * **Devuelve**
     *   ```HTTP 201```  si fue creado exitosamente.
     *  ```HTTP 400``` no se logro crear el usuario, por falta de datos o por no cumplir las validaciones.

**Login**
Se debe hacer un POST a ```/login``` con un archivo que contenga los siguientes datos:
 ```
 {
   "username": "Test",
   "password": "Password"
}

 ```
 * **Devuelve**
     *   ```HTTP 200```  si el login fue exitoso.
     *  ```HTTP 400``` no se logro realizar el login ya sea porque no se encontró el usuario o la contraseña es incorrecta.
