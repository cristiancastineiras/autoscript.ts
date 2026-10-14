SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
# Manual del integrador de
# Autofirma v1.9

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
2
### Índice de contenidos
1 Objeto del documento ...................................................................................................................7
2 Introducción ...................................................................................................................................8
2.1 Licencia .......................................................................................................................................9
2.1.1 Licencias Java .........................................................................................................................9
2.2 Recursos .....................................................................................................................................9
2.3 Adecuación al Esquema Nacional de Seguridad ........................................................................9
3 Requisitos mínimos ..................................................................................................................... 11
3.1 Entorno cliente ........................................................................................................................ 11
3.1.1 Autofirma ............................................................................................................................ 11
3.1.2 Autofirma App Android ....................................................................................................... 12
3.1.3 Autofirma App iOS............................................................................................................... 12
3.2 Entorno servidor ..................................................................................................................... 12
4 Operaciones soportadas ............................................................................................................. 13
5 Despliegue de Autofirma............................................................................................................. 14
5.1 Información preliminar ........................................................................................................... 14
5.2 Importación de AutoScript ...................................................................................................... 15
5.2.1 Importación en páginas Web generadas dinámicamente .................................................. 16
5.3 Servicios de Autofirma ............................................................................................................ 16
5.3.1 Servicios auxiliares de comunicación .................................................................................. 17
5.3.2 Servicios de firma trifásica y firma de lotes ........................................................................ 19
5.3.3 Configuración de los servicios ............................................................................................. 24
5.4 Configuración del Content Security Policy............................................................................... 26
6 Integración de Autofirma en un trámite web ............................................................................. 27
6.1 Carga de la aplicación.............................................................................................................. 28
6.1.1 Configuración de los puertos de comunicación .................................................................. 28
6.1.2 Configuración de los servicios auxiliares de comunicación ................................................ 29
6.1.3 Forzado de la comunicación a través de los servicios auxiliares ........................................ 30
6.1.4 Restricción según desfase horario con el servidor .............................................................. 31
6.1.5 Selección del almacén de claves ......................................................................................... 32

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
3
6.1.6 Configuración de versión mínima ....................................................................................... 38
6.1.7 Configuración del diálogo de carga y error ......................................................................... 39
6.2 Firma electrónica..................................................................................................................... 48
6.2.1 Firma de múltiples documentos (firma masiva) ................................................................. 50
6.2.2 Firma trifásica ...................................................................................................................... 53
6.3 Cofirma electrónica ................................................................................................................. 54
6.4 Contrafirma electrónica .......................................................................................................... 57
6.4.1 Selección de nodos.............................................................................................................. 59
6.5 Firma de lotes predefinidos .................................................................................................... 60
6.5.1 Creación del lote ................................................................................................................. 61
6.5.2 Agregar documentos al lote ................................................................................................ 62
6.5.3 Firma del lote ...................................................................................................................... 64
6.5.4 Ejemplo de operación de firma de lote ............................................................................... 68
6.5.5 Firma de lotes sin servidor (monofásica) ............................................................................ 69
6.5.6 Antiguo mecanismo de firma de lotes ................................................................................ 72
6.6 Selección de certificado .......................................................................................................... 73
6.7 Operaciones de gestión de ficheros ........................................................................................ 74
6.7.1 Guardado de datos en disco ............................................................................................... 75
6.7.2 Selección y recuperación de un fichero por parte del usuario ........................................... 78
6.7.3 Selección y recuperación de múltiples ficheros por parte del usuario ............................... 80
6.8 Métodos de utilidad JavaScript ............................................................................................... 81
6.8.1 Conversión de una cadena Base64 a texto ......................................................................... 81
6.8.2 Conversión de un texto a cadena Base64 ........................................................................... 82
6.8.3 Descarga de datos remotos ................................................................................................ 83
7 Configuración de las operaciones ............................................................................................... 85
7.1 Paso de parámetros adicionales ............................................................................................. 85
7.2 Omisión de diálogos gráficos .................................................................................................. 86
7.3 Configuración de los filtros de certificados ............................................................................. 86
7.4 Selección automática de certificados...................................................................................... 93
7.5 Configuración de la política de firma ...................................................................................... 94

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
4
7.5.1 Política de firma de la AGE v1.9 .......................................................................................... 94
7.5.2 Política de firma de Factura electrónica (Facturae) ............................................................ 95
7.6 Validación de firmas previas ................................................................................................... 95
8 Formatos de firma ....................................................................................................................... 97
8.1 Configuración de firmas CAdES ............................................................................................... 98
8.1.1 Algoritmos de firma............................................................................................................. 99
8.1.2 Firmas CAdES implícitas o explícitas ................................................................................... 99
8.1.3 Parámetros adicionales ....................................................................................................... 99
8.2 Configuración de firmas XAdES ............................................................................................. 104
8.2.1 Algoritmos de firma........................................................................................................... 105
8.2.2 Algoritmos de huella digital para las referencias .............................................................. 106
8.2.3 Situación del nodo de firma en XAdES Enveloped ............................................................ 106
8.2.4 Transformaciones sobre el contenido a firmar ................................................................. 107
8.2.5 Uso de estructuras Manifest en firmas XAdES .................................................................. 108
8.2.6 Tratamiento de las hojas de estilo XSL de los XML a firmar ............................................. 111
8.2.7 Parámetros adicionales ..................................................................................................... 111
8.3 Configuración de firmas PAdES ............................................................................................. 123
8.3.1 Algoritmos de firma........................................................................................................... 124
8.3.2 Operaciones no soportadas y notas de interés................................................................. 124
8.3.3 Creación de una firma visible ............................................................................................ 125
8.3.4 Inserción de una imagen en un documento PDF antes de ser firmado ............................ 131
8.3.5 Firma de documentos PDF cifrados o protegidos con contraseña ................................... 132
8.3.6 Documentos certificados .................................................................................................. 132
8.3.7 Comprobación de PDF Shadow Attack.............................................................................. 133
8.3.8 Parámetros adicionales ..................................................................................................... 134
8.4 Configuración de firmas de factura electrónica .................................................................... 140
8.4.1 Operaciones no soportadas y notas de interés................................................................. 141
8.4.2 Algoritmos de firma........................................................................................................... 141
8.4.3 Parámetros adicionales ..................................................................................................... 141
9 Compatibilidad con dispositivos móviles .................................................................................. 143

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
5
9.1 Requisitos de despliegue....................................................................................................... 143
9.2 Limitaciones .......................................................................................................................... 144
9.2.1 Limitaciones de formato ................................................................................................... 144
9.2.2 Limitaciones funcionales ................................................................................................... 144
9.2.3 Limitaciones de entono ..................................................................................................... 145
9.3 Recomendaciones de despliegue .......................................................................................... 145
9.4 Notificaciones al usuario ....................................................................................................... 147
10 Problemas conocidos ................................................................................................................ 149
10.1 No se puede acceder al almacén de claves de Firefox 49.0 y superiores ............................. 149
10.2 No se puede acceder al almacén de claves de Firefox 58 ..................................................... 149
10.3 No se detecta la inserción/extracción del DNIe en el lector (u otra tarjeta inteligente) ...... 150
10.4 Falla la operación de firma con DNIe o una tarjeta de la FNMT ........................................... 150
10.5 No se permite la firma de PDF con ciertos certificados ........................................................ 151
10.6 El servicio de firma trifásica genera un error al realizar firmas XAdES en servidores JBoss . 151
10.7 Las firmas con DNIe requieren que se introduzca el PIN del DNIe por cada operación de firma
151
10.8 No aparece el certificado de firma de un DNIe ..................................................................... 152
10.9 Autofirma no puede comunicarse con el navegador en macOS ........................................... 152
10.10 Se solicita múltiples veces la contraseña del Llavero de macOS al firmar ........................ 153
10.11 Sólo se realiza la firma del primer documento de una serie cuando se realizan las firmas
desde Google Chrome ....................................................................................................................... 153
10.12 No se abre la aplicación de firma al realizar la firma desde Google Chrome ................... 154
10.13 No se abre la aplicación de firma con Edge Legacy (EdgeHTML) ...................................... 155
10.14 No se abre la aplicación de firma con Firefox cuando el servidor declara una política de
seguridad (CSP) ................................................................................................................................. 155
ANEXO I. Comunicación AutoScript - Autofirma .......................................................................... 157
I.1. Comunicación por sockets ........................................................................................................ 157
I.2. Comunicación por servidor intermedio .................................................................................... 158
ANEXO II. Firma trifásica ................................................................................................................ 160
II.1. Servicios de firma trifásica y de lotes ........................................................................................ 161
II.1.1. Gestor de documentos del servicio................................................................................... 161

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
6
II.1.2. Gestores de documentos personalizados ......................................................................... 164
II.1.2.1. Desarrollo de un gestor de documentos personalizado ............................................... 164
II.1.2.2. Configuración de un gestor de documentos personalizado ......................................... 167
II.2. Uso de la firma trifásica con los gestores de documentos ....................................................... 167
II.2.1. Gestor de documentos “FileSystemDocumentManager” ...................................... 168
II.2.1.1. Parámetros de uso y descripción del funcionamiento .................................................. 168
II.2.1.2. Configuración en alta disponibilidad con varios nodos ................................................ 169
II.2.2. Gestor de documentos “LegacyBatchDocumentManager” ................................... 170
II.2.2.1. Parámetros de uso y descripción del funcionamiento .................................................. 170

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
7
### 1 ### Objeto del documento
En el presente documento se detalla el proceso de integración y configuración de Autofirma para la
generación de firmas de usuario en trámites web.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
8
### 2 ### Introducción
Autofirma es una solución de firma electrónica que permite a sus usuarios generar firmas con sus
certificados locales. Está especialmente orientado a ser integrado dentro de trámites web de tal
forma que una aplicación web pueda solicitar al usuario la firma de unos datos a través de Autofirma
y obtener como respuesta la firma de esos datos.
Para la firma con Autofirma a través de un trámite web son necesarios los siguientes componentes:
• Autofirma (para sistemas Windows, Linux o macOS) o Autofirma App (para dispositivos
Android o iOS). Esta aplicación debe estar instalada en el dispositivo del usuario antes de
iniciar el proceso de firma.
• AutoScript, un JavaScript de despliegue para la integración del proceso de firma dentro del
trámite web.
• Servicio de firma trifásica. Este servicio es necesario para generar algunos formatos de firma
con Autofirma App, aunque también puede usarse desde Autofirma para aprovechar alguna
de las ventajas de la firma trifásica. Se vuelve opcional si no van a usarse estas ventajas, si la
aplicación web no va a ser compatible con dispositivos móviles o si se usan formatos de firma
para los que Autofirma App soporta la firma monofásica.
Además de los componentes mencionados, el uso de determinadas funciones de Autofirma o su
compatibilidad con determinados entornos puede requerir el despliegue de diversos servicios
auxiliares a los que deberá conectar la aplicación cliente.
Autofirma hace uso de los certificados digitales X.509v3 y de las claves privadas asociadas a estos que
estén instalados en el repositorio o almacén de claves y certificados (KeyStore) del sistema operativo
o del navegador Web (Internet Explorer, Mozilla Firefox, etc.) del usuario. También se permite el uso
de certificados en dispositivos criptográficos (tarjetas inteligentes, dispositivos USB) instalados en el
sistema y con controlador CSP/PKCS#11 compatible (como, por ejemplo, el DNI Electrónico o DNIe) y
certificados en almacenes software (PKCS#12/PFX). La clave privada del usuario no abandona en
ningún caso el almacén de claves ni sale del equipo del usuario.
Autofirma no almacena ningún tipo de información personal del usuario, ni hace uso de cookies ni
ningún otro mecanismo para la gestión de datos de sesión. Autofirma sí almacena el log de su última
ejecución a efectos de ofrecer soporte al usuario si se encontrase algún error durante su ejecución.
Autofirma forma parte de la suite de productos de @firma, pero no interacciona con ninguno de los
servicios del resto de productos. Autofirma sólo genera firmas electrónicas con los certificados de
usuario. La validación de estas firmas y su promoción a firmas longevas, por ejemplo, son operaciones
que deberán realizarse de forma independiente con otros productos de la suite (@firma, VALIDe,
Integr@...)

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
9
2.1 Licencia
Autofirma es software libre y puede usarse, según se desee, bajo licencia GNU General Public License
versión 2 (GPLv2) o bajo licencia European Software License 1.1 (EUPL 1.1) o superior.
Autofirma incluye, entre otros, los siguientes productos de terceros con licencias compatibles:
• JXAdES (https://github.com/universitatjaumei/jxades)
• SpongyCastle (https://rtyley.github.io/spongycastle/)
• Código derivado de iText v2.1.7 (http://itextpdf.com/)
• Código derivado de Java Mime Magic Library (http://jmimemagic.sourceforge.net/)
• Apache Santuario (https://santuario.apache.org/)
• Proxy Vole (https://github.com/MarkusBernhardt/proxy-vole)
• Java WebSocket (https://github.com/TooTallNate/Java-WebSocket)
2.1.1 Licencias Java
Autofirma, en sus versiones para Windows y macOS, incluye una máquina virtual de Java (JVM) para
la ejecución de la aplicación.
• Microsoft Windows (64bits):
o OpenJDK JRE 21.0.6 (licencia GPL v2)
• macOS
o OpenJDK JRE 21.0.6 (licencia GPL v2)
Las licencias de las JVM incluidas en Autofirma permiten su uso sin coste de licencia.
Las aplicaciones para Android e iOS utilizan únicamente el entorno de ejecución proporcionado por
el del sistema y no requieren licencia.
2.2 Recursos
Puede consultar la información relativa al proyecto Autofirma y descargar el código fuente y los
binarios de la aplicación en la siguiente dirección Web:
http://administracionelectronica.gob.es/ctt/clienteafirma
Así mismo, el código de Autofirma se encuentra disponible en GitHub y sus distintos módulos se
encuentran disponibles en el repositorio central de Maven:
• Fuentes: https://github.com/ctt-gob-es/clienteafirma
• Binarios: https://search.maven.org/search?q=es.gob.afirma
2.3 Adecuación al Esquema Nacional de Seguridad
Los productos de la Suite @firma pueden permitir el uso de algoritmos no recomendados por la Guía
807 del Esquema Nacional de Seguridad (ENS; editada por el Centro Criptológico Nacional, CCN)

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
10
vigente en el momento de publicación de este documento. Queda bajo la responsabilidad de las
aplicaciones que hacen uso de estos productos el configurar adecuadamente las llamadas a los
mismos para generar el resultado esperado, válido y adecuado para ese momento y el nivel de
seguridad deseado, utilizando para ello algoritmos de la familia SHA-2 tal y como especifica dicha
norma para la generación de firmas electrónicas.
Puede consultar la norma vigente desde el siguiente enlace:
https://www.ccn-cert.cni.es/series-ccn-stic/800-guia-esquema-nacional-de-seguridad/513-ccn-stic-
807-criptologia-de-empleo-en-el-ens/file.html

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
11
### 3 ### Requisitos mínimos
3.1 Entorno cliente
Los requisitos mínimos del entorno cliente dependerá de la aplicación nativa utilizada para firmar.
Debido a la amplia variedad de navegadores del mercado, sólo se citarán para cada aplicación cliente
aquellos navegadores para los que se han realizado pruebas específicas. No excluye esto que pueda
funcionar correctamente con otros entornos.
3.1.1 Autofirma
El uso de Autofirma como herramienta de firma integrada dentro del proceso de firma de trámites
web tiene los siguientes requerimientos en cuanto a entorno operativo:
• Sistema Operativo
o Microsoft Windows 7 o superior.
▪ Soportado directamente en 7, 8, 8.1, 10 y 11.
▪ En 32 o 64 bits.
o Linux.
▪ Soportado directamente en Ubuntu 20.04 LTS, Fedora 35 y OpenSUSE 15.3.
o macOS Catalina o superior.
▪ Soportado directamente en Ventura, Monterey y Big Sur.
• Navegadores Web (Cuando es invocada desde una aplicación web)
o Microsoft Windows
▪ Google Chrome 46 o superior.
▪ Mozilla Firefox 41.0.2 o superior.
▪ Microsoft Edge 60 o superior (Edge Chromium).
▪ Microsoft Internet Explorer 8 o superior.
▪ Microsoft Edge Legacy v20 o superior (EdgeHTML).
o Linux
▪ Mozilla Firefox 41.0.1 o superior.
o macOS
▪ Apple Safari 9.0 o superior.
▪ Google Chrome 46 o superior.
▪ Mozilla Firefox 65 o superior.
En entornos macOS y Windows no es necesario que el usuario tenga instalado un entorno de
ejecución de Java, ya que viene incluido en la propia aplicación. En Linux se necesita un entorno de
ejecución de Java OpenJDK (marcado como recomendacíon en el instalador de Autofirma para
permitir el uso de la compilación preferida del usuario de la JRE (versión 8 o superior).
Para el acceso al almacén de Firefox en algunas versiones de Windows puede ser necesario instalar
los entornos de ejecución redistribuibles de Microsoft Visual C++ 2015. Si Autofirma no puede cargar

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
12
los certificados de su almacén de claves, siga las instrucciones descritas en el apartado de errores
conocidos No se puede acceder al almacén de claves de Firefox 49.0 y superiores.
3.1.2 Autofirma App Android
El uso de Autofirma App para Android como herramienta de firma integrada dentro del proceso de
firma de trámites web tiene los siguientes requerimientos en cuanto a entorno operativo:
• Sistema Operativo
o Android 4.3 o superior.
• Navegadores Web (para la invocación por protocolo)
o Google Chrome.
o Navegador webkit.
3.1.3 Autofirma App iOS
El uso de Autofirma App para iOS como herramienta de firma integrada dentro del proceso de firma
de trámites web tiene los siguientes requerimientos en cuanto a entorno operativo:
• Sistema Operativo
o iOS 13 o superior.
• Navegadores Web (para la invocación por protocolo)
o Apple Safari.
3.2 Entorno servidor
Autofirma requiere de una serie de servicios auxiliares para el uso de ciertas funcionalidades y la
compatibilidad con determinados entornos. Los requisitos de estos servicios son los siguientes:
• Servidor de aplicaciones JEE compatible con Servlets de Java.
o Apache Tomcat, WildFly, RedHat JBoss, IBM WebSphere, Oracle GlassFish, Oracle
Application Server, etc.
• JRE 1.7 o superior.
Puede saber más acerca de los servicios auxiliares de Autofirma, consulte el apartado 5.3 Servicios
Autofirma.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
13
### 4 ### Operaciones soportadas
Autofirma proporciona funcionalidades de firma electrónica (incluyendo firmas múltiples) con
certificados locales, pero no otras operaciones de firma o criptografía como validación de firmas,
promoción a formatos longevos, sellado de tiempo, creación de sobres digitales o cifrado.
Adicionalmente, Autofirma proporciona un conjunto de métodos de utilidad y opciones de operación.
Las operaciones soportadas por Autofirma son:
• Firma electrónica.
• Firmas electrónicas múltiples (más de un firmante por documento).
o Cofirma.
o Contrafirma.
• Firma de lotes de documentos.
• Selección de certificado.
• Funciones de utilidad:
o Conversión de una cadena Base64 a texto.
o Conversión de un texto a una cadena Base64.
o Guardado de datos en disco.
o Carga de fichero local.
o Carga de multiples ficheros.
Si su aplicación requiere una funcionalidad de firma no soportada por Autofirma, consulte el catálogo
de aplicaciones de @firma para determinar cuál es la más apropiada para sus necesidades.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
14
### 5 ### Despliegue de Autofirma
Para integrar la firma con Autofirma en su aplicación web debe desplegar con ella AutoScript.
AutoScript es el JavaScript de despliegue (“autoscript.js”) que contiene el objeto JavaScript que
deberemos utilizar para invocar a las distintas operaciones de Autofirma y obtener su resultado.
Adicionalmente y según el entorno de ejecución del usuario, es posible que para la comunicación
entre el AutoScript y Autofirma sea necesario el uso de dos servicios de comunicación. Estos dos
servicios, se distribuyen junto al JavaScript de despliegue en forma de archivos WAR (“afirma-
signature-retriever.war” y “afirma-signature-storage.war”) y deberían desplegarse
en el mismo dominio que la página web desde la que se use Autofirma. Las funcionalidades de firma
trifásica y firma de lotes también requieren el despliegue de un servicio adicional (“afirma-server-
triphase-signer.war”).
Consulte en el apartado 5.3 Servicios Autofirma en qué casos son necesarios estos servicios y así
determinar si debe realizar su despliegue.
5.1 Información preliminar
En este apartado se presentan distintos aspectos que el integrador debe tener en cuenta antes del
despliegue de Autofirma:
• Como medida de seguridad, Autofirma no permite el despliegue en páginas a las que se
acceda mediante “127.0.0.1” o “localhost”. Si va a realizar pruebas en su equipo local,
deberá tomar alguna de las siguientes alternativas:
o Acceda a su página y a los servicios de Autofirma a través de la IP de red que tenga
asignada su equipo.
o Configure en el fichero hosts de su equipo un alias para “127.0.0.1” y utilícelo
como nombre de dominio. La localización del fichero hosts según el sistema
operativo es:
▪ En Windows: UNIDAD:\\Windows\System32\drivers\etc\
▪ En Linux y macOS: /etc/hosts
• La página web, AutoScript y los servicios de Autofirma deben ser accesibles desde el mismo
dominio. De esta forma se evitarán errores debido a los mecanismos de seguridad del
navegador para bloquear ataques de Cross-Site Scripting (XSS). Esto es especialmente
importante cuando se hace uso de los servicos auxiliares de comunicación
(StorageService y RetrieveService).
o Despliegue una instancia de los servicios auxiliares de comunicación por cada
aplicación en la que integre Autofirma o, al menos, por cada dominio.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
15
• Siempre que se utilice Autofirma ha de tenerse en cuenta que la aplicación nativa debe poder
confiar en los certificos SSL utilizados por cualquier servicio externo al que se deda conectar.
En caso contrario, fallaría la conexión. Esto es crítico cuando se hace uso de la comunicación
por servidor intermedio o se utiliza la operación de firma trifásica.
o En el caso de usar Autofirma, puede evitar problemas durante el desarrollo y pruebas
desactivando la comprobación de los certificados SSL o agregando su dominio a la
lista de dominios seguros. Puede hacer esto desde el panel de preferencias, en la
pestaña “General”, desactivando la casilla de verificación “Aceptar sólo
conexiones con sitios seguros (Recomendado)” o accediento al apartado
“Dominios seguros”.
o En el caso de aplicaciones de firma móvil Android, puede desactivar la validación de
certicados o agregar el dominio a la lista de dominios seguros desde el menú
“Configuración”.
• Codificación UTF-8 de las páginas cuando se proporcionen o recojan textos de Autofirma.
o Autofirma interpreta todos los textos, tanto los recibidos como los devueltos en las
respuestas, usando el juego de caracteres UTF-8. Para poder transmitirlos y
mostrarlos correctamente desde una página web es necesario que esta se encuentre
codificada en UTF-8 y lo declare como tal.
o En caso de no ser posible, se recomienda:
▪ Que el Base64 de los textos a proporcionar a Autofirma se hayan obtenido
desde un entorno en el que se pueda gantizar que originalmente estaban
codificados en UTF-8. Por ejemplo, que el texto ya estuviese previamente
codificado o que se codifique a través de un servicio.
▪ No mostrar directamente al usuario los mensajes devueltos por el propio
Autofirma.
5.2 Importación de AutoScript
Para integrar Autofirma en su página Web debe importar en ella la biblioteca JavaScript
“autoscript.js”. Puede hacer referencia a la misma mediante una URL absoluta o mediante una
URL relativa a partir de la dirección de publicación de su página Web.
Por ejemplo, se puede introducir la carga de la biblioteca en la sección head del HTML, tal y como se
muestra en el siguiente ejemplo:
…
<head>
<script src="https://miweb.com/afirma/js/autoscript.js"></script>
…

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
16
Si la página Web en la que deseamos cargar Autofirma estuviese también en la ruta
“https://miweb.com/afirma” se podría hacer referencia a la biblioteca “autoscript.js” de forma
relativa indicando:
…
<head>
<script src="js/autoscript.js"></script>
…
Cualquier página Web con esta biblioteca JavaScript importada está lista para utilizar Autofirma.
5.2.1 Importación en páginas Web generadas dinámicamente
En un sistema Web actual, lo habitual es que las páginas Web no residan pre-construidas en
directorios Web, sino que estas se generen dinámicamente mediante alguna de las muchas
tecnologías disponibles de aplicaciones Web (JSP, ASP, PHP, etc.).
En estos casos es necesario tener en cuenta que la dirección de la biblioteca JavaScript debería
establecerse en base a la URL de despliegue de la página si se hace de forma relativa. En caso de duda,
utilice la URL absoluta.
5.3 Servicios de Autofirma
La compatibilidad de Autofirma con determinados entornos y funciones puede requerir el despliegue
de una serie de servicios auxiliares. Estos servicios se distribuyen en forma de archivos WAR junto al
AutoScript y deberían desplegarse por cada aplicación o sistema que desee utilizarlos.
Los archivos WAR en los que se distribuyen estos servicios no requieren el uso de un software servidor
de aplicaciones concreto. Consulte el apartado 3.2 Entorno servidor para saber más de los requisitos
de despliegue y la documentación de su servidor de aplicaciones para saber cómo desplegarlos.
En caso de que su aplicación no tenga que ser compatible con los entornos o las funcionalidades
listadas a continuación, no será necesario el despliegue de ningún servicio. Esto es, que no tendrá
que desplegarlos en los siguientes casos:
• Si no se requiere compatibilidad con Internet Explorer 10 ni con Safari 10 ni versiones
anteriores de ambas aplicaciones.
• Si no se requiere compatibilidad con dispositivos móviles.
• Si no se utilizan operaciones de firma trifásica o firma de lotes.
Cada uno de estos servicios requiere un fichero de configuración, pero la lógica para definir la
ubicación de estos ficheros es la misma para todos ellos. Este aspecto de la configuración se detalla
en el apartado 5.3.3 Configuración de los servicios.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
17
5.3.1 Servicios auxiliares de comunicación
AutoScript destecta cual es el entorno de ejecución del usuario y decide qué mecanismo debe utilizar
para comunicarse con Autofirma en ese entorno, ya que, por ejemplo, no es posible hacerlo de igual
manera en un equipo de escritorio que en un dispositivo móvil. En algunos casos será necesario el
uso de dos servicos auxiliares de comunicación, por lo que se deberán desplegar estos servicios
cuando:
• Desee que su despliegue sea compatible con entornos móviles.
• Desee que su despliegue sea compatible con Internet Explorer 10 y anteriores (o una versión
superior en modo compatibilidad con estas versiones).
• Cuando la aplicación fuerce intencionadamente la comunicación a través de estos servicios.
Estos servicios se distribuyen junto con el JavaScript de despliegue de Autofirma y son los siguientes:
• StorageService
o Este Servlet permite almacenar datos en un directorio temporal del servidor.
o Este servicio se despliega por medio del WAR “afirma-signature-
storage.war”.
• RetrieveService
o Este Servlet permite recuperar datos de un servidor. Los datos devueltos deben estar
almacenados en un directorio temporal predefinido y, tras devolver los datos, el
servicio borrará el fichero temporal en donde se almacenaban. Este servicio nunca
devolverá datos que se guardasen hace más de un tiempo máximo configurado,
devolviendo error tal como si no hubiese encontrado el fichero de datos. Igualmente,
borrará todos aquellos ficheros del directorio temporal que hayan sobrepasado este
tiempo máximo desde su creación.
o Este servicio se despliega por medio del WAR “afirma-signature-
retriever.war”.
En el resto de los casos, AutoScript y Autofirma se comunicarán a través de sockets. Consulte el
apartado ANEXO I Comunicación AutoScript - Autofirma para saber más sobre los mecanismos de
comunicación entre el JavaScript de despliegue y la propia aplicación de Autofirma.
Importante: Los servicios de almacenamiento y guardado en servidor deben ser accesibles desde
el mismo dominio en el que se encuentre la página de firma. Si no se hiciese así, el navegador web
puede bloquear la conexión con ellos interpretando que se trata de un ataque de cross-site
scripting (XSS).
5.3.1.1.1 Configuración de los servicios de almacenaje y recuperación
Los servicios de almacenaje y recuperación sirven para comunicar el JavaScript de despliegue y la
aplicación nativa de Autofirma firma mediante el guardado temporal de los datos en un directorio
concreto del servidor.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
18
Este directorio temporal debe ser visible y accesible por todas las instancias en ejecución de los
servicios. Este aspecto es especialmente importante en configuraciones de servidores de aplicaciones
en alta disponibilidad, donde puede haber varios nodos que presten el servicio, cada uno de ellos en
un sistema de ficheros diferente.
El que todos los nodos accedan al mismo directorio referenciado en la configuración se puede lograr
fácilmente usando un almacenamiento compartido entre todos ellos (con el mismo punto de
montaje), mediante enlaces simbólicos, etc. Es importante también asegurarse de que todos los
nodos tienen los permisos adecuados sobre los directorios configurados.
Los servicios de almacenaje y recuperación de datos para la comunicación entre AutoScript y
Autofirma (StorageService y RetrieveService, respectivamente), utilizan el mismo fichero de
configuración. Este fichero es “intermediate_config.properties”, que debe encontrarse en
un directorio indetificado por la ruta absoluta transmitida a través de un parámetro “-
Dclienteafirma.config.path”.
Las propiedades disponibles en este fichero de configuración son las siguientes:
• tmpDir: Es el directorio del servidor en donde se almacenarán los datos temporales.
o Debe contener el mismo valor en los servicios de guardado y recogida de datos si
estos se desplegasen por separado.
o A este directorio sólo necesitan acceder los servicios de guardado y recuperación de
datos, por lo que el administrador del sistema puede determinar que sólo estos
servicios pueden acceder a dicho directorio.
o En caso de realizarse un despliegue en múltiples nodos, el directorio debería
encontrarse en una unidad compartida por todos ellos.
o Si no se configura esta propiedad, se usará el directorio temporal del servidor.
• expTime: Es el tiempo de caducidad en milisegundos de los ficheros del directorio. Una vez
superado ese tiempo desde la creación del fichero, el servicio de recuperación se negará a
devolverlo y lo eliminará.
o Si no se configura esta propiedad, se usará por defecto el valor “60000” (1 minuto)
• maxFileSize: Es el tamaño máximo de fichero permitido expresado en bytes. Su utilidad
responde principalmente a motivos de seguridad, para evitar que el directorio del servidor
se quede sin espacio si comienzan a subirse datos de gran tamaño.
o Si no se configura esta propiedad, se usará por defecto el valor “0”, que indica que
no hay límite de tamaño de fichero.
• debug: Habilita el modo debug cuando se configura el valor “true”. El modo debug sólo
debería habilitarse durante la fase de integración y nunca en entornos productivos. En este
modo:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
19
o Se muestran traza de log adicionales.
o No se eliminan los ficheros recuperados del servicior intermedio.
o No se eliminan los ficheros caducados del directorio temporal del servidor
intermedio.
o No se limita el tamaño máximo de los ficheros a guardar.
Un ejemplo de fichero de configuración podría ser:
# Directorio para el guardado de los ficheros. Por defecto: Directorio temporal
tmpdir=C:/clienteafirma/temp
# Tiempo de caducidad de los mensajes. Por defecto: 60000 (1 minuto)
expTime=60000
# Tamano maximo de fichero en bytes. Por defecto: 0 (Sin limite)
maxFileSize=1048576
5.3.1.1.1.1 Consideraciones de seguridad
Un posible ataque de denegación de servicio sobre este sistema de almacenaje temporal es
simplemente hacer muchas peticiones de almacenaje hasta que se alcance la capacidad total del
sistema de ficheros.
Los servicios proporcionados no incorporan ninguna medida contra estos ataques más que la
limitación del tamaño de fichero, por lo que debe ser el integrador el que las implemente. Algunas
de estas medidas podrían ser:
• Establecer cuotas de disco para el directorio configurado en tmpDir.
• Detectar (y prevenir) múltiples llamadas al servicio de almacenamiento desde una misma
dirección sin estar acompañadas de las respectivas llamadas de recuperación.
• Detectar (y prevenir) múltiples llamadas al servicio de almacenamiento en una frecuencia
inusualmente alta.
5.3.2 Servicios de firma trifásica y firma de lotes
Estos servicios se distribuyen en el archivo desplegable “afirma-server-triphase-
signer.war” y deberán desplegarse cuando:
• Desee que su despliegue sea compatible con entornos móviles.
o Para más información, consulte el apartado 9 Compatibilidad con dispositivos
móviles.
• Desee utilizar las funciones de firma trifásica de Autofirma.
o Para más información, consulte el apartado 6.2.2 Firma trifásica.
• Desee utilizar las funciones de firma de lotes.
o Para más información, consulte el apartado 6.5 Firma de lotes predefinidos.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
20
Los servicios en cuestión son los siguientes:
• SignatureService
o Servicio para la ejecución de operaciones de firma trifásica.
o Requerido cuando deseamos utilizar este tipo de operación y cuando se realizan
firmas desde las aplicaciones móviles.
• presign
o Servicio para la carga de documentos y prefirma en los procesos de firma de lotes.
• postsign
o Servicio para la postfirma en los procesos de firma de lotes y guardado de las firmas.
Advertencia: Autofirma 1.7 y anteriores hacían uso de un mecanismo de firma de lotes distinto al
actual, que usaba sus propios servicios y se configuraban de forma separada. Estos servicios siguen
incluyéndose en el “afirma-server-triphase-signer.war”, pero se consideran obsoletos y
sólo deberían seguir usándose para dar soporte a los antiguos despliegues de firma trifásica,
también soportados por Autofirma 1.8 y superiores. Si desea utilizar el antiguo sistema de firma
de lotes, consulte la documentación de Autofirma 1.7.
5.3.2.1 Configuración del servicio trifásico
Los servicios de firma trifásica y de lotes se configuran a través del fichero
“tps_config.properties”, que debe encontrarse en un directorio identificado por la ruta absoluta
transmitida al servidor de aplicaciones a través de un parámetro “-
Dclienteafirma.config.path”. Se puede proporcionar este parámetro en el arranque del
servidor de aplicaciones.
Las propiedades que pueden establecerse en este fichero son:
• Access-Control-Allow-Origin
o Permite establecer el origen permitido de las peticiones. Los servicios agregarán el
valor de esta propiedad en las respuestas del servicio.
o Si se establece como valor un asterisco (‘*’), se indica que se pueden realizar
peticiones desde cualquier dominio.
o Valor por defecto: *
• xml.provider.apache
o Permite forzar el proveedor de firma XML que se debe utilizar. Si se indica false, se
forzará el proveedor de Sun. Cualquier otro valor, hará que se utilice el proveedor de
Apache. Esto puede ser útil para evitar problemas de compatibilidad con bibliotecas
de procesado de XML (como XERCES y XALAN) que puedan encontrarse en el
classpath del servidor de aplicaciones. Este tipo de bibliotecas pueden interferir con
las que incluye el propio Oracle Java e impedir realizar firmas XAdES.
o Valor por defecto: true
• document.manager

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
21
o Clase que se encargará de gestionar los documentos que se deben firmar y las firmas
generadas en los procesos de firma trifásica y de lote.
o Valor por defecto:
▪ es.gob.afirma.triphase.server.document.SelfishDocumentManager
• El gestor de documentos (Document Manager) por defecto imita un
proceso de firma monofásica, lo cual quiere decir que se deberán
proporcionar los datos a firmar en las llamadas a las operaciones de
firma y de lote.
o Para saber más de la firma trifásica y las ventajas que ofrece consulte el apartado
ANEXO II Firma trifásica.
• verification.key
o Clave utilizada para generar el código de verificación de las firmas.
o Si se configura aquí un valor (puede ser cualquiera), se utilizará este para generar un
código de verificación de los datos enviados a firmar. Este código se genera en la
prefirma en base a los datos y se comprueba en la postfirma para garantizar que la
firma generada se realizó sobre los datos originalmente prefirmados.
o Por defecto, no se configura ningún valor y no se realizará está validación.
• cacheEnabled
o Establece si se deben guardar en caché los documentos durante la firma. Se habilita
con el valor “true” y se mantiene deshabilitada con cualquier otro valor.
o Por regla general, el documento a firmar es necesario tanto en la prefirma como en
la postfirma. Esto quiere decir que se deberá recuperar en dos ocasiones mediante
el gestor de documentos configurado. Si recuperarlo del entorno en el que se
encuentre es un proceso pesado, se puede configurar que guardé en caché el
documento durante la prefirma para no tener que volverlo a recuperar durante la
posfirma.
o Valor por defecto: false
o La implementación de la caché se determina mediante la propiedad
“document.cache.manager” de este mismo fichero.
o Téngase en cuenta que según el gestor de documentos y la implementación de caché
puede o no ser conveniente habilitar el uso de la caché. Por regla general, sólo se
debería habilitar la caché cuando se implemente un gestor de documentos
personalizado, no los incluidos por defecto en el servicio de firma trifásica, y cuando
la recuperación de este documento del gestor de documentos sea más costosa que
la recuperación de los datos de la caché, lo cual dependerá de la implementación de
caché utilizada.
• document.cache.manager
o Clase que se encargará de guardar y recuperar datos de la caché.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
22
o La implementación por defecto usa el disco cómo caché, ya que el guardado en
memoria puede sobrepasar los límites establecidos para el servicio cuando se
procesen varias peticiones simultáneamente.
o Valor por defecto:
▪ es.gob.afirma.triphase.server.cache.FileSystemCacheManager
o Este propiedad solo se tendrá en cuenta si se activase la caché mediante la propiedad
“cacheEnabled”.
• maxPagesToCheckShadowAttack
o Número máximo de páginas sobre las que comprobar el PDF Shadow Attack. Se
puede omitir la comprobación indicando "0" paginas o permitir que se haga sobre
todo el documento indicando el valor "all". Por defecto, 10.
o Se puede consultar más información sobre la validación de PDF Shadow Attack en el
apartado 8.3.7 Comprobación de PDF Shadow Attack.
• tmpdir
o Directorio para el guardado de los ficheros temporales. Si no se indica, se usará el del
usuario, aunque es recomendable el uso de un directorio específico para este fin.
• concurrent.enable
o Determina como procesar las firmas en las operaciones de firma de lotes. Puede
tener dos valores:
▪ true
• Indica que se permite el proceso en paralelo de las entradas del lote.
▪ false
• Las firmas del lote se procesarán secuencialmente. Este es el valor
por defecto.
• concurrent.timeout
o Numero de segundos que debera durar como maximo cada fase de una operacion de
firma en modo concurrente. Si se excediese este tiempo, se detendria y se
consideraria que se produjo un error.
o Valor por defecto: 30
• concurrent.maxsigns
o Número máximo de firmas que se procesaran concurrentemente en caso de estar
activo el modo concurrente.
o Valor por defecto: 10
• batch.maxDocuments
o Indica el numero máximo de documentos que se pueden enviar en una petición.
o Valor por defecto: 15
• batch.maxSize
o Indica el tamaño máximo global en bytes que puede tener la petición en bytes.
o Valor por defecto: 100000
• batch.maxReferenceSize

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
23
o Indica el tamaño máximo en bytes que puede tener la referencia a los ficheros dentro
de la petició.
o Valor por defecto: 50000
• batch.maxDocSize
o Indica el tamaño máximo en bytes que puede tener un fichero que se esté
procesando a través del mecanismo antiguo de firma por lotes.
o Valor por defecto: 100000
El fichero de configuración básico por defecto será:
# Orígenes permitidos
Access-Control-Allow-Origin=*
# Permite indicar si se debe usar el proveedor de firma XML de Apache.
xml.provider.apache=true
# Clase del gestor de documentos a utilizar (debe implementar DocumentManager)
document.manager=es.gob.afirma.triphase.server.document.SelfishDocumentManager
# Clave de verificacion
verification.key=
# Habilitar caché
cacheEnabled=false
# Clase de implementacion de cache a utilizar (debe implementar
DocumentCacheManager)
document.cache.manager=es.gob.afirma.triphase.server.cache.FileSystemCacheManag
er
# Numero maximo de paginas sobre las que comprobar el PDF Shadow Attack.
maxPagesToCheckShadowAttack=10
# Directorio para el guardado de temporales
tmpdir=
# Operacion concurrente (true) o en serie (false)
concurrent.enable=false
# Numero de segundos maximos para cada operacion de firma
concurrent.timeout=30
# Numero maximo de firmas procesadas concurrentemente
concurrent.maxsigns=10
# Limite del tamano del documento en bytes en antiguo mecanismo de firma de
lotes
batch.maxDocSize=50000

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
24
Adicionalmente, en este fichero se podrán configurar todas aquellas propiedades que se deseen
establecer para el gestor de documentos y la implementación de caché configurados. Así, por
ejemplo, en el gestor de documentos a través de sistema de ficheros
(“FileSystemDocumentManager”) que se proporciona junto al servicio como muestra, se puede
configurar un directorio de entrada de los datos y uno de salida para las firmas, así como si se desean
sobreescribir los datos en el directorio de salida. También se incluye junto al servicio el gestor
“LegacyBatchDocumentManager”, orientado a proporcionar al sistema de firma de lotes actual la
misma funcionalidad que proporcionaba el sistema de firma de lotes de Autofirma 1.7 y anteriores.
Consulte el apartado II.1.1 Gestor de documentos del servicio para saber más acerca de los gestores
de documentos y sobre el gestor de documentos a través de sistema de ficheros.
Si se activase el uso de la caché y se configurase la implementación por defecto
(es.gob.afirma.triphase.server.cache.FileSystemCacheManager), se usarían las siguientes
propiedades adicionales del fichero de configuración:
• cache.tmpDir: Ruta absoluta del directorio del servidor donde se almacenarán
temporalmente los documentos guardados en caché.
• cache.expTime: Tiempo de caducidad en milisegundos de los archivos cacheados. Debe ser
un número entero y positivo. Valor por defecto: 60000.
• cache.maxUseToCleaning: Configura cada cuántos usos se limpiará la caché. Durante el
proceso de limpieza, se eliminará un fichero de la caché si ha excedido el tiempo de
caducidad. Valor por defecto: 300.
Un desarrollador Java podría crear nuevos sistemas de caché e integrarlos en el servicio. Esto le
permitiría a crear procesos optimos que redujesen las transferencias de datos por red.
Para implementar un sistema de caché, se deberá implementar la interfaz
es.gob.afirma.triphase.server.cache.DocumentCacheManager, disponible en el módulo
“afirma-server-triphase-signer-document” del proyecto. Puede importar este módulo a su
proyecto Maven mediante la referencia:
<dependency>
<groupId>es.gob.afirma</groupId>
<artifactId>afirma-server-triphase-signer-document</artifactId>
<version>1.8</version>
</dependency>
5.3.3 Configuración de los servicios
Independientemente de su función, todos los servicios que acompañan a Autofirma siguen la misma
lógica para localizar su fichero de configuración y el uso de variables de entorno. En este apartado se
explica cómo configurar estos aspectos comunes a todos ellos.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
25
Los servicios de Autofirma utilizan uno o varios ficheros de propiedades para su configuración. Estos
ficheros tienen nombres prefijados, pero el integrador puede definir su ubicación mediante la
variable de entorno “clienteafirma.config.path”. El valor asignado a esta variable debe ser la
ruta del directorio en el que se encontrarán esos ficheros. La variable puede establecerse, por
ejemplo, por medio de la variable $JAVA_OPTS al levantar el servidor de aplicaciones. Por ejemplo:
JAVA_OPTS=“%JAVA_OPTS% -Dclienteafirma.config.path=/opt/usuarios/cliente/conf”
También se puede hacer uso de otras variables declaradas por uno mismo o por el propio servidor de
aplicaciones. Por ejemplo:
JAVA_OPTS=“%JAVA_OPTS% -Dclienteafirma.config.path=%CATALINA_HOME%/conf/afirma”
En caso de no declararse la variable de entorno, se buscarán los ficheros en el classpath de la
aplicación, por lo que podría introducirse el fichero de configuración dentro de los WAR de los
servicios.
Cada uno de los ficheros de configuración de los servicios de Autofirma está compuesto por una serie
de propiedades con valores asignados. El valor establecido en esas propiedades será el utilizado por
los servicios, pero también es posible heredar parte de la configuración mediante variables de
entorno. Para utilizar el valor de una variable de entorno como parte o todo el valor de una de las
propiedades de configuración, estableceremos en el fichero el nombre de la variable en cuestión
delimitado por las partículas “${” y “}”. Por ejemplo:
Se podría establecer una propiedad en el arranque del servidor de aplicaciones:
JAVA_OPTS=“%JAVA_OPTS% -Dclienteafirma.config.path=%CATALINA_HOME%/conf/afirma –
DtempDir=%CATALINA_HOME%/temp/afirma”
Mientras, en nuestro fichero de configuración podríamos establecer el valor de una propiedad
valiéndonos de esa propiedad del sistema que hemos establecido:
# Se usará como directorio temporal, el subdirectorio "temp", localizado
# en el directorio configurado por medio de la propiedad de sistema "tempDir".
tmpdir=${tempDir}/temp
Los ficheros de configuración se leen una única vez durante la carga de los servicios por lo que, tras
realizar un cambio en ellos, será necesario reiniciar el servidor de aplicaciones para que los servicios
los apliquen.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
26
5.4 Configuración del Content Security Policy
Autofirma y las aplicaciones móviles atienden las peticiones realizadas desde el AutoScript por medio
del protocolo “afirma”. Si su servidor web utiliza cabeceras CSP (Content Security Policy) para limitar
las fuentes de las que cargar los recursos de sus páginas web, es probable que algunos navegadores
Web (se ha identificado el caso concreto de Mozilla Firefox) rechacen la llamada a estas URL externas.
En caso de que el servidor no utilice cabeceras CSP, no será necesario hacer nada para el
funcionamiento de Autofirma. Si, en cambio, sí se utilizan, será necesario agregar a esta cabecera el
esquema “afirma://” para garantizar que el navegador permite el acceso a este tipo de URL. Para
hacer esto, se agregará la partícula “afirma://*” en la fuente por defecto de la política de seguridad.
Por ejemplo, si la cabecera con la política de seguridad fuese:
Content-Security-Policy: default-src 'self' *.site.com; img-src *
Se modificaría para convertirlo en:
Content-Security-Policy: default-src 'self' *.site.com afirma://*; img-src *

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
27
### 6 ### Integración de Autofirma en un trámite web
El API de Autofirma se expone automáticamente al entorno JavaScript al importar en la página web
la biblioteca “autoscript.js”. En esta biblioteca está definido el objeto “AutoScript” y a partir
de él se podrá invocar a todas las operaciones de Autofirma. Por ejemplo, para inicializar Autofirma:
AutoScript.cargarAppAfirma();
O, para firmar:
AutoScript.sign(…);
La operación de inicialización de Autofirma no implica una llamada a la aplicación nativa, únicamente
inicializa el objeto JavaScript, por lo que puede realizarse durante la carga de la página en la que se
va a realizar la firma y es recomendable que se haga así. El resto de las llamadas, sin embargo, sí
pueden implicar la invocación a Autofirma, la aplicación externa encargada de ejecutar las
operaciones de firma entre otras.
La comunicación con Autofirma se realiza de forma asíncrona. Para poder gestionar esto, todas las
funciones que implican llamar a Autofirma permiten que se les proporcione una función callback a
través de la cual obtener el resultado.
Para el correcto uso de Autofirma deben seguirse siempre las siguientes normas:
• No lanzar operaciones de forma automática. Todas las operaciones deberían desencadenarse
a raíz de una acción del usuario. Por ejemplo, no se debe llamar al método de firma durante
la carga de la página web. En su lugar, por ejemplo, se debería mostrar un botón “Firmar” y,
cuando el usuario pulse dicho botón, llamar a la operación de firma.
• No se deben lanzar simultáneamente varias operaciones de Autofirma. Hasta que no se
obtenga el resultado de una operación a través de su función callback, no se debería llamar
a la siguiente. Así, por ejemplo, no se permitiría hacer lo siguiente:
AutoScript.sign(…); // ERROR: La segunda función se llamará antes de
AutoScript.sign(…); // terminar la anterior
En su lugar, se debería usar:
// Funcion callback ejecutada al procesar el resultado de la Firma 1
function callbackFirma1(…) {
AutoScript.sign(…); // Firma 2
}
…

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
28
AutoScript.sign(…, callbackFirma1, …); // Firma 1
6.1 Carga de la aplicación
Una vez importado el JavaScript en la página Web, deberemos inicializar el objeto de comunicación
con Autofirma mediante el método:
cargarAppAfirma()
Es necesario haber llamado al método de carga de Autofirma antes de realizar cualquier otra de las
operaciones soportadas por la aplicación.
A continuación, se muestran diferentes ejemplos de carga de Autofirma:
• Carga directa desde el código HTML:
…
<body>
<script type="text/javascript">
AutoScript.cargarAppAfirma();
</script>
…
• Carga desde una función invocada en el momento de firmar:
function firmar() {
AutoScript.cargarAppAfirma();
AutoScript.sign(
dataB64,
"SHA512",
"PAdES",
null,
firmaCorrectaCallback,
firmaErrorCallback);
}
La función de carga de Autofirma sólo se debería invocar una única vez por página web. Así, no se
debe utilizar este último ejemplo si se va a llamar varias veces al método de firma.
6.1.1 Configuración de los puertos de comunicación
El trámite web y Autofirma se comunicarán comúnmente a través de un socket abierto en el equipo.
Por defecto, es el propio AutoScript el que gestiona qué número de puerto que debe usar para la
apertura del socket, pero el propio trámite web puede establecer una configuración específica si
conoce el entorno de sus usuarios y lo considera conveniente.
La aplicación puede configurar los puertos a utilizar mediante el método:
setPortRange (port1, port2)

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
29
La llamada a este método configura que para la comunicación debe seleccionarse un puerto aleatorio
de entre los determinados por el rango port1-port2, ambos inclusive. Si sólo se indicase un
parámetro en el método o si ambos fuesen el mismo número de puerto, se utilizaría siempre ese
puerto para la comunicación.
Por defecto, el javascript escogerá un puerto en el rango 49152-65535. Sin embargo, al utilizar este
método, se puede establecer cualquier subrango de entre los puertos 2014 y 65535.
Este método puede ser llamado antes o después del método de carga, pero debe llamarse antes de
invocar a la primera operación que requiera la apertura de la aplicación. Una vez invocada una
operación el puerto no se puede establecer ni cambiar.
Ejemplos de uso de este método serían:
• Configuración de un rango de puertos específico:
…
<body>
<script type="text/javascript">
AutoScript.setPortRange(61000, 62000);
AutoScript.cargarAppAfirma();
</script>
…
• Configuración de un puerto concreto:
…
<body>
<script type="text/javascript">
AutoScript.setPortRange(63117);
AutoScript.cargarAppAfirma();
</script>
…
6.1.2 Configuración de los servicios auxiliares de comunicación
La comunicación entre la página del trámite web y las aplicaciones móviles se realizará a través de los
servicios auxiliares de almacenamiento y recuperación que habrá que desplegar junto a la página de
firma. También se utilizan estos con Autofirma cuando la aplicación lo indica expresamente.
Por regla general, es buena práctica desplegar siempre estos servicios y configurarlos en nuestra
aplicación, ya que posibilitan que el trámite de firma sea compatible con diversos entornos de
usuario, como con dispositivos móviles y versiones antiguas de Internet Explorer y Microsoft Edge
Legacy.
Para la configuración de los servicios de comunicación se usará el método:
setServlets (storageServiceUrl, retrieveServiceUrl)

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
30
Este método debería usarse antes del método de carga para garantizar que ya de inicio se carga toda
la configuración de Autofirma. Un ejemplo de configuración de los servicios auxiliares es:
…
<body>
<script type="text/javascript">
AutoScript.setServlets(
"https://gobierno.es/afirma-signature-storage/StorageService",
"https://gobierno.es/afirma-signature-retriever/RetrieveService");
AutoScript.cargarAppAfirma();
</script>
…
Recuerde que, para evitar que se produzcan errores de cross-site scripting (XSS), los servicios
auxiliares de comunicación deben estar disponibles desde el mismo dominio que la página web desde
la que se realiza la firma.
Consulte el apartado 5.3.1 Servicios auxiliares de comunicación para saber más acerca de los servicios
auxiliares de comunicación y los entornos de usuario para los que son necesarios.
6.1.3 Forzado de la comunicación a través de los servicios auxiliares
Una aplicación puede forzar a que siempre se utilice la comunicación a través de los servicios
auxiliares, ya sea para mantener un comportamiento homogéneo en todos los entornos, para evitar
problemas específicos con algún entorno o para optimizar algún proceso de firma concreto. Esto, sin
embargo, debería evitarse en la medida de lo posible.
Se puede forzar la comunicación a través de los servicios auxiliares invocando al método:
setForceWSMode(force)
Al invocar a este método con el parámetro true antes de invocar al método de carga, el mecanismo
de comunicación quedará prefijado al de servicios auxiliares. Sin embargo, no se recomienda usar
este método salvo en casos muy específicos, como cuando se utilizan operaciones de firma trifásica
con un gestor de documentos a medida.
Advertencia: Diversas características y medidas de seguridad de los navegadores Chrome y Edge
afectan al uso de Autofirma cuando se comunican a través de los servicios auxiliares. Si se forzarse
al uso de estos servicios, debe evitarse realizar dos o más llamadas a las funciones que invoquen a
Autofirma a raíz de una única interacción del usuario. Por ejemplo, no se podría invocar una
llamada a una operación de Autofirma desde la función callback de una operación anterior.
Google Chrome y Microsoft Edge imponen restricciones adicionales que también afectan a la
compatibilidad del despliegue con dispositivos móviles. Para saber más acerca de estas
restricciones y la comunicación con servidor intermedio, consulte el apartado I.2 Comunicación
por servidor intermedio.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
31
Un ejemplo de forzado de la comunicación a través de los servicios auxiliares es:
…
<body>
<script type="text/javascript">
AutoScript.setForceWSMode(true);
AutoScript.setServlets(
"https://gobierno.es/afirma-signature-storage/StorageService",
"https://gobierno.es/afirma-signature-retriever/RetrieveService");
AutoScript.cargarAppAfirma();
</script>
…
6.1.4 Restricción según desfase horario con el servidor
Al realizar una firma en el equipo del usuario, se registra en la propia firma la hora del propio equipo
(esto no aplica a las operaciones de firma trifásicas). En caso de que la hora y/o fecha del equipo se
encuentren mal configuradas, es posible que una validación posterior de la firma provoque errores,
sobre todo si se trabaja también con sellos de tiempo. Por norma general, esto sólo ocurre en casos
extremos y no suele ser necesario aplicar ninguna medida para evitar esto.
AutoScript incluye una función que compara la hora del equipo del usuario con la del servidor web
para así detectar el desfase horario que hay entre ambos. En caso de detectar un desfase se puede
advertir al usuario o incluso bloquear la operación de firma.
Para hacer la comprobación de desfase horario puede utilizar el método JavaScript:
checkTime(checkType, maxMillis, checkURL)
Este método debe invocarse antes del método de carga de Autofirma y puede recibir como
parámetros:
• checkType
o Tipo de verificación que se desea realizar. Admite los valores:
▪ AutoScript.CHECKTIME_NO: No realiza ningún tipo de comprobación. Este
es el valor por defecto.
▪ AutoScript.CHECKTIME_RECOMMENDED: Realiza la comprobación horaria y,
en caso de encontrar un desfase, pedirá al usuario que lo corrija antes de
continuar.
▪ AutoScript.CHECKTIME_OBLIGATORY: Realiza la comprobación horaria y, en
caso de encontrar un desfase, pedirá al usuario que lo corrija y evitará que
Autofirma se ejecute en cualquier llamada posterior.
• maxMillis

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
32
o Milisegundos máximos que se permiten de desfase. Se recomienda que se indique
un periodo mínimo de 1 minuto (60.000 milisegundos) para facilitar la corrección de
la hora en el equipo del usuario.
o El valor por defecto son 5 minutos (300.000 milisegundos).
• checkURL
o URL contra la que se realizara la petición para obtener la hora del servidor.
o Por defecto, se usará la URL de la página cargada en el navegador. Si cree que es
posible que esto ocasione un mal funcionamiento por parte de su aplicación, indique
otra URL dentro de su dominio.
Un ejemplo de uso sería:
…
<body>
<script type="text/javascript">
AutoScript.checkTime(AutoScript.CHECKTIME_RECOMMENDED, 300000);
AutoScript.cargarAppAfirma();
</script>
…
Debe notarse que, según la configuración del servidor web, es posible que no se pueda determinar la
hora a través de la información que este proporciona. De ser así, no se mostrará ninguna advertencia
al usuario para no perjudicar la realización del trámite. También es posible que un servidor sólo
transmita la hora en la primera carga de la página y no cuando esta se refresca. Si ese fuese el caso,
sólo se advertiría de la diferencia horaria en la primera carga de la página y no si el usuario refrescase
la página desde su navegador.
Téngase en cuenta también que el desfase horario se calcula en el momento de invocar al método
checkTime. Así pues, si el usuario modificase la hora de su sistema después de la comprobación,
podría realizar operaciones de firma sin que se le mostrasen advertencias.
En caso de que desee bloquear de forma completa la firma de datos cuando se detecte una hora
incorrecta en el sistema, asegúrese de que el servidor de la página web de comprobación de hora
siempre envía la hora en las respuestas de sus peticiones y llame al método checkTime antes de
cada operación de firma.
6.1.5 Selección del almacén de claves
Autofirma accede al almacén de claves del navegador web o el sistema operativo del usuario para
ofrecer sus certificados en las operaciones de firma. Los almacenes utilizados por defecto por cada
una de las aplicaciones son:
• Autofirma:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
33
o Si se utiliza Firefox, se accederá al almacén de claves interno del navegador y se
buscarán las tarjetas inteligentes configuradas como dispositivos de seguridad en
este.
o En cualquier otro caso, se usará el del sistema operativo.
▪ Windows: CAPI (Cryptography Application Programming Interface)
▪ macOS: Llavero de macOS
▪ Linux: Almacén compartido NSS
o Cuando se detecte un DNIe o una tarjeta CERES conectada al equipo, Autofirma
accederá a ella y dará la posibilidad de firmar con sus certificados,
independendientemente de que también se muestren los certificados del navegador
o del sistema operativo.
• Autofirma App para Android:
o Utiliza el almacén de claves de Android.
• Autofirma App para iOS:
o Utiliza el almacén de la propia aplicación.
Aunque se recomienda no seleccionar el uso de un almacén de claves distinto al por defecto, ya que
esto puede confundir al usuario, Autofirma permite que se configure otro de los almacenes
soportados. Las aplicaciones móviles, en cambio, sólo admiten el almacén por defecto.
Para establecer el almacén de claves al que debe acceder Autofirma, se deberá utilizar el siguiente
método antes de invocar a cualquier operación de firma o selección de certificado:
setKeyStore (keystore);
En esta función:
• keystore
o Tipo de almacén al que se debe URL de acceso a los datos a descargar.
o En el objeto AutoScript se han definido las siguientes claves para configurar
almacenes de claves:
▪ KEYSTORE_WINDOWS
▪ Almacén de certificados CAPI. Compatible únicamente con sistemas
Microsoft Windows.
▪ KEYSTORE_APPLE
▪ Llavero de macOS. Compatible únicamente con sistemas Apple
macOS.
▪ KEYSTORE_SHARED_NSS
▪ Almacén NSS del sistema. Compatible únicamente con sistemas
Linux.
▪ KEYSTORE_MOZILLA
▪ Almacén NSS de Mozilla (Mozilla Firefox, Mozilla Thunderbird, etc.).

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
34
▪ KEYSTORE_PKCS12
▪ Almacén en fichero PKCS#12 / PFX (Personal File Exchange).
▪ KEYSTORE_JAVA
▪ Almacén en fichero JKS (Java KeyStore).
▪ KEYSTORE_JCEKS
▪ Almacén en fichero JCEKS (Java Cryptography Extension KeyStore).
▪ KEYSTORE_JAVACE
▪ Almacén en fichero de tipo CaseExactJKS (Case Exact Java KeyStore).
▪ KEYSTORE_PKCS11
▪ Almacén de claves compatible PKCS#11 (tarjetas inteligentes,
aceleradora criptográfica…).
Si se selecciona un almacén no disponible en el entorno del usuario, Autofirma dará error al intentar
acceder al almacén de claves. Las aplicaciones móviles únicamente ignorarán esta opción de la
configuración.
Advertencia: En sistemas Linux no es posible cambiar entre almacenes NSS. Si ya se ha cargado el
almacén del sistema no se podrá cargar el de Firefox y viceversa.
Determinados tipos de almacén permiten indicar el fichero o biblioteca en disco asociado al almacén.
Este fichero o biblioteca debe indicarse mediante su ruta absoluta en el sistema del usuario, como
parte del mismo parámetro, a continuación del tipo de almacén y separados por signo dos puntos
(‘:’), siguiendo el patrón:
TIPO_ALMACEN:RUTA_ALMACEN
Los almacenes que permiten indicar el fichero o biblioteca que se debe utilizar son:
• KEYSTORE_APPLE
o Permite indicar un fichero de tipo llavero en el que se encuentran los certificados de
firma.
o Si no se indica ningún fichero se usa el llavero general del sistema.
• KEYSTORE_PKCS12
o Permite indicar el almacén en fichero de tipo PKCS#12/PFX (normalmente con
extensiones “p12” o “pfx”) en el que se encuentran los certificados de firma.
o Si no se indica ningún fichero Autofirma solicitará al usuario que seleccione uno
mediante un diálogo gráfico.
• KEYSTORE_PKCS11
o Permite indicar la biblioteca que se debe utilizar para acceder al dispositivo que
almacena los certificados de firma.
o Si no se indica ningún fichero, Autofirma solicitará al usuario que seleccione uno
mediante un diálogo gráfico.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
35
o Es importante reseñar que la biblioteca PKCS#11 es dependiente del sistema
operativo y de su arquitectura, por lo que, si se indica, por ejemplo, una biblioteca
PKCS#11 como una DLL (Dynamic Link Library) de 32 bits, no funcionará ni en Linux
ni en macOS, pero tampoco en Windows si se utiliza Autofirma 64 bits.
Advertencia: Los almacenes que hacen uso de un fichero o biblioteca requieren una contraseña de
acceso. Esta contraseña se preguntará directamente al usuario cuando se requiera el acceso al
almacén.
A continuación, se muestran ejemplos de selección del almacén de claves:
• Configuración del almacén de Windows:
AutoScript.cargarAppAfirma();
AutoScript.setKeyStore(AutoScript.KEYSTORE_WINDOWS);
…
AutoScript.sign (dataB64, "SHA512", "CAdES", null, successCallback,
errorCallback);
• Configuración de un almacén PKCS#12 en una ruta conocida:
AutoScript.cargarAppAfirma();
AutoScript.setKeyStore(AutoScript.KEYSTORE_PKCS12 +
":/usr/home/usuario/almacen.p12");
…
AutoScript.sign (dataB64, "SHA512", "CAdES", null, successCallback,
errorCallback);
• Configuración de un controlador PKCS#11 para el acceso de dispositivo critprográfico:
AutoScript.cargarAppAfirma();
AutoScript.setKeyStore(AutoScript.KEYSTORE_PKCS11 +
":C:\\Windows\\System32\\PkcsV2GK.dll");
…
AutoScript.sign (dataB64, "SHA512", "CAdES", null, successCallback,
errorCallback);
En sistemas Windows, puede darse el caso de que el usuario utilice un perfil temporal, con lo que el
usuario no contará con certificados ni tarjetas instaladas en el almacén de Windows. Cuando
Autofirma detecte este caso, hará uso del controlador de tarjetas integrado en la aplicación
(JMulticard) para acceder a un DNIe o tarjeta CERES insertada en un lector del equipo. Además,
buscará en el sistema una serie predeterminada de bibliotecas PKCS#11 y tratará de utilizar las
tarjetas inteligentes insertadas y asociadas a estas bibliotecas.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
36
6.1.5.1 Uso de tarjetas inteligentes
Autofirma tiene acceso a las claves de las tarjetas inteligentes a partir de sus controladores cuando
están instalados en el sistema. Para utilizar los certificados en tarjeta en las operaciones de firma, se
puede acceder a ellos desde un almacén PKCS#11 configurado o desde cualquiera de los almacenes
de sistema disponibles:
• KEYSTORE_WINDOWS: El almacén de Windows carga automáticamente todas las tarjetas
insertadas para las que se haya instalado su controlador CSP o el MiniDriver correspondiente
de Windows Update. En caso de detectarse un DNIe insertado o una tarjeta CERES, se hará
uso de estos a partir de un controlador interno de la aplicación para corregir problemas
detectados con Java en los controladores oficiales.
• KEYSTORE_MOZILLA/ KEYSTORE_SHARED_NSS: Los almacenes de Mozilla se componen de un
almacén interno y el conjunto de controladores PKCS#11 de las tarjetas instaladas en el
sistema. Autofirma cargará automáticamente el almacén interno y todos los dispositivos
detectados. Debido a problemas de incompatibilidad detectados entre Java y los
controladores oficiales de DNIe y tarjetas CERES, en caso de detectarse insertada cualquiera
de estas tarjetas se utilizará un controlador interno de la aplicación, ignorándose los PKCS#11
configurados en el almacén de Mozilla. En caso de detectar alguna de estas tarjetas también
se ignorarán el resto de los dispositivos insertados para evitar problemas entre los distintos
controladores.
• KEYSTORE_APPLE: El llavero de macOS se compone de un almacén internos y el conjunto de
controladores de las tarjetas insertadas. Debido a problemas detectados con Java y los
controladores oficiales de DNIe y tarjetas CERES, en caso de detectarse insertada cualquiera
de estas tarjetas se utilizará un controlador interno de la aplicación.
Por regla general, se considera que sólo debería haber una tarjeta inteligente insertada en el
momento de firmar. En caso de encontrarse varias, se dará prioridad al DNIe y las tarjetas CERES. En
dichos casos, es posible que los certificados del resto de tarjetas no aparezcan disponibles para firmar
o den error durante la firma.
El uso de las tarjetas CERES de la FNMT y del DNIe se realiza a través de las bibliotecas de JMulticard,
por lo que no es necesario tener instalados sus controladores en el equipo para poder firmar con
ellas.
Advertencia: Existen controladores de tarjetas inteligentes que, tras la inserción de la tarjeta,
registran en el almacén de Windows los certificados que contiene. A partir de entonces, los
certificados se muestran en el almacén incluso sin tener la tarjeta insertada. Se ha encontrado que
en Windows 10 21H1 y superiores este comportamiento produce problemas con Java y Autofirma,
ya que al intentar cargar el almacén de claves se intentan cargar esos certificados que en realidad
no se encuentran en el almacén. El resultado es que el proceso de carga puede llevar varios
minutos, lo que se traduce en que se tarda ese tiempo en mostrarse el diálogo de selección de

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
37
certificados o realizar la firma si el certificado se seleccionaba directamente. Subsiguientes firmas
no conllevan esperar este tiempo, ya que para entonces el almacén ya está cargado, pero volverá
a suceder si se recarga el almacén.
Para solventar esta situación es necesario eliminar esos certificados del almacén de Windows
cuando la tarjeta no se encuentra insertada.
Advertencia: A partir de cierta versión del controlador de la tarjeta CERES se ha apreciado que, si
se tiene en el almacén de Windows instalado un certificado que también se encuentra en el
almacén de la tarjeta inteligente, el certificado local se elimina tras el uso de la tarjeta. Este
comportamiento no está relacionado con el uso de Autofirma.
6.1.5.2 Uso del DNIe
Autofirma utiliza la biblioteca JMulticard para permitir firmar con DNIe sin necesidad de que los
usuarios tengan instalados los controladores de la tarjeta. Esta biblioteca se utilizará siempre que se
encuentre un DNIe insertado en un lector del equipo y se inserte su PIN en el diálogo de JMulticard.
La aplicación solicita el PIN del DNIe antes de listar los certificados del almacén y de que el usuario
indique qué certificado desea utilizarla para firmar. Este comportamiento emula el de los
controladores PKCS#11 de las tarjetas en donde el PIN es necesario para listar los certificados
contenidos por la tarjeta y sigue la lógica de que si un usuario ha insertado el DNIe en el lector es
porque lo desea utilizar. Cuando el usuario inserta el PIN, se listan sus certificados y se abre el canal
seguro con la tarjeta y, en el momento de firmar, se utiliza este canal seguro para realizar la operación
de firma. A continuación, se cierra el canal seguro.
Las operaciones de firma realizadas posteriormente desde la misma instancia del Autofirma,
solicitarán el PIN de la tarjeta sólo en el momento de realizar la firma, momento en el cual se volverá
a abrir el canal seguro con la tarjeta.
Si se recargase el almacén por medio de la opción correspondiente del diálogo de selección de
certificados, el controlador se reiniciaría y volvería a pedir el PIN de la tarjeta para listar los
certificados.
El diálogo de solicitud de PIN de JMulticard mostrará una casilla para indicar que se desea recordar la
contraseña de la tarjeta durante el resto de la sesión. Esta casilla funciona cuando las firmas se
realizan dentro de la misma operación (firma de lotes, contrafirmas de varios nodos…). Para que se
recuerde la contraseña a lo largo de distintas operaciones es necesario que se utilice
simultáneamente la función “setStickySignatory()”, descrita en el apartado 6.2.1 Firma de
múltiples documentos (firma masiva). En el momento en el que se cierra la instancia de Autofirma
(se cambia de página, se utiliza comunicación por servidor intermedio, se cumple el tiempo máximo
de inactividad en la comunicación por sockets, etc.), dejará de surtir efecto la configuración de
“setStickySignatory()” y se volverá a pedir el PIN de la tarjeta.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
38
En el caso de ejecutar Autofirma usando el almacén de Windows y cancelar el diálogo de PIN del DNIe
de JMulticard, se cargará el almacén del sistema normalmente. Si se tiene instalado el controlador
oficial del DNIe en el equipo esto puede implicar que los certificados del DNIe se listen también en el
diálogo de selección de certificados ya que será el controlador oficial el que los cargue. En estos casos,
también se usará el controlador oficial para realizar la firma.
6.1.6 Configuración de versión mínima
Puede ocurrir que una nueva versión de Autofirma introduzca nuevas opciones de configuración y
que, al usarlas, versiones anteriores de Autofirma las ignoren. El ejemplo más común son las opciones
de configuración de los distintos formatos de firma. Si una versión de Autofirma permite configurar
algún aspecto de un formato, el integrador puede pasarle un parámetro adicional para configurarlo.
Esa versión de Autofirma aplicará la configuración, pero las versiones anteriores la ignorarán, de tal
forma que la firma se generará en ambos casos, pero cumplirá o no los requisitos del integrador según
la versión de Autofirma que utilice el usuario.
Para evitar estas discrepancias, se introdujo en Autofirma 1.8 la función JavaScript:
setMinimumClientVersion (version);
Esta función permite indicarle a Autofirma qué versión mínima debe ser para satisfacer los requisitos
del trámite. Si no la cumple, Autofirma avisará al usuario para que actualice la aplicación. Un ejemplo
de uso sería:
<script type="text/javascript">
AutoScript.cargarAppAfirma();
// Establecemos que se van a solicitar una configuración que requiere
// al menos que el Cliente sea Autofirma 1.9
AutoScript.setMinimumClientVersion("1.9");
…
// Llamamos a la operación de firma. Si Autofirma no cumple con la
// versión mínima indicada, la aplicación bloqueará la operación y
// pedirá al usuario que la actulice
AutoScript.sign( dataB64,
"SHA512withRSA",
"PAdES",
parametrosAdicionales,
firmaCorrectaCallback,
firmaErrorCallback);
Debe tenerse encuenta que las firmas trifásicas se realizan a través del servicio de firma trifásica y es
este el que aplica la configuración de los formatos de firma. Es decir, si usamos firma trifásica, no
estamos sujetos a qué versión de Autofirma o los clientes móviles estemos usando en lo que se refiere
a la configuración de los formatos de firma.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
39
6.1.7 Configuración del diálogo de carga y error
AutoScript muestra por defecto un diálogo de carga después de llamar a la primera operación de
Autofirma mientras se espera a establecer comunicación con él. También muestra por defecto
diálogos de error cuando no se consigue conectar con el cliente o si se detectó un error en el
despliegue. Este comportamiento, sin embargo, es configurable, así como el aspecto de estos
diálogos. El integrador puede usar el objeto JavaScript “SupportDialog” (disponible a través de
“autoscript.js”) antes del método de carga del cliente de firma para invocar los distintos métodos de
configuración de los diálogos. Los distintos aspectos configurables se detallen en los siguientes
apartados.
Por lo general, cualquier llamada a los métodos de configuración del diálogo de carga y error deberá
realizarse antes de llamar al método de carga del cliente de firma (6.1 Carga de la aplicación).
6.1.7.1 Activación/desactivación del diálogo
A pesar de que se encuentran activados por defecto, es posible desarctivar el uso del diálogo para
que sea nuestra propia aplicación la que gestione cualquier posible interacción con el cliente de firma.
Para activar o desactivar los diálogos se utilizan los siguientes métodos:
• enableSupportDialog(enabled)
o Activa o desactiva el diálogo de carga y error. El valor true (por defecto), lo activa;
false, lo desactiva.
• enableLoadingDialog(enabled)
o Activa o desactiva el diálogo de espera durante la carga. El valor true (por defecto),
lo activa; false, lo desactiva. En caso de haber desactivado el uso general del diálogo
mediante enableSupportDialog, se ignorará el uso de este método.
• enableErrorDialog(enabled)
o Activa o desactiva el diálogo de error. El valor true (por defecto), lo activa; false,
lo desactiva. En caso de haber desactivado el uso general del diálogo mediante
enableSupportDialog, se ignorará el uso de este método.
Por ejemplo:
…
// Desactivamos el uso del dialogo de carga
SupportDialog.enableLoadingDialog(false);
AutoScript.cargarAppAfirma();
…
6.1.7.2 Configuración de los enlaces de descarga del cliente de firma
Cuando se produce un error durante la carga del cliente de firma que pueda hacer suponer que éste
no está instalado, se le muestra al usuario el enlace de descarga del cliente. Este enlace variará según
si el sistema operativo del usuario requiere instalar Autofirma, Autofirma App para Android o
Autofirma App para iOS, de tal forma que apuntará al PAE o a la tienda de aplicaciones en cuestión

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
40
según se necesite. Se ofrece, sin embargo, la posibilidad de personalizar estos enlaces por si el
organismo prefiriera distribuir desde un dominio propio una copia del cliente, quisiera usar una
versión anterior o tuviese una versión personalizada.
Los métodos para enlazar a cada aplicación son:
• setPCDownloadURL (htmlText)
o Establece el texto HTML con el enlace a la aplicación de firma en PC.
• setAndroidDownloadURL (htmlText)
o Establece el texto HTML con el enlace a la aplicación de firma en Android.
• setIOSDownloadURL (htmlText)
o Establece el texto HTML con el enlace a la aplicación de firma en iOS.
Nótese que estos métodos pueden no recibir una URL, sino el texto HTML necesario para presentar
el enlace al cliente o la web de descargas. Así, por ejemplo, puede indicar un texto con un elemento
“<a href=” con el enlace o una estructura más compleja como los enlaces a las tiendas de aplicación
que suelen incluir una imagen con el logotipo de la tienda.
Por ejemplo, se podría configurar:
…
var downloadLink = " <a target='_blank'
href='https://midominio.es/Descargas.html'>Portal de descargas<img
src='external.png' alt='Enlace externo'/></a>";
SupportDialog.setPCDownloadURL(downloadLink);
AutoScript.cargarAppAfirma();
…
Con esta configuración, por ejemplo, si fallase la carga de Autofirma se mostraría el siguiente diálogo:
Ilustración 1 Diálogo con enlace de descarga personalizado

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
41
6.1.7.3 Enlace de contacto con el administrador
AutoScript es capaz de identificar algunos problemas de servicio durante su carga, como que no se
encuentren disponibles los servicios del servidor intermedio. En estos casos, si el integrador ha
indicado un medio de contacto con el administrador del sistema o la persona responsable, el diálogo
de error mostrará esta información.
Se puede establecer la información de contacto con el administrador mediante el método:
setAdminContactInfo(htmlText);
Por ejemplo, si se quisiera configurar correo y un enlace a un formulario de contacto, por ejemplo, se
podría hacer:
…
var contactInfoHtml = "<a
href='mailto:admin@dominio.es'>admin@dominio.es</a> / <a
href='https://domnio.es/form/contact.html'>Formulario de contacto</a>";
SupportDialog.setAdminContactInfo(contactInfoHtml);
AutoScript.cargarAppAfirma();
…
Con esta configuración, por ejemplo, si se configurase el acceso por servidor intermedio y fallase la
conexión con un servicio se mostraría el siguiente diálogo:
Ilustración 2 Diálogo con contacto del administrador
6.1.7.4 Enlaces a aplicaciones móviles alternativas
Puede ocurrir que no deseemos que nuestros usuarios utilicen nuestro procedimiento web desde
dispositivos móviles porque ya tengamos una aplicación móvil que permita realizar ese trámite. Por
ejemplo, si tuviésemos un Portafirmas web y una app Portafirmas móvil, nos interesaría que al
acceder desde a web desde un móvil, se le indicase al usuario que instalase la app.
AutoScript permite configurar los enlaces a las aplicaciones móviles que se pueden usar como
alternativa a realizar el trámite vía web. Para configurar estos enlaces pueden usarse los métodos:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
42
• setAlternativeAndroidAppLink(htmlText)
o Establece el enlace a la aplicación Android a través de la que realizar el trámite.
• setAlternativeIOSAppLink(htmlText)
o Establece el enlace a la aplicación Android a través de la que realizar el trámite.
El criterio que sigue AutoScript para identificar la compatibilidad del trámite con dispositivos móviles
es que si no se han establecido expresamente las URL del servidor intermedio (no se ha usado el
método setServlets()) y estoy servicios no es tán disponibles (cuando son siempre necesarios
para el funcionamiento en Android e iOS), entonces se entiende que el despliegue no es compatible
con dispositivos móviles. Es decir, si no quieres que tu despliegue sea compatible con móvil y los
usuarios deben usar una app en su lugar, no uses el método setServlets() y no despliegues los
servicios del servidor intermedio.
Por ejemplo:
…
var androidLink = "<a
href='https://play.google.com/store/apps/details?id=es.app.alternative'><img
alt='Desc&aacute;rgalo de Google Play'
src='https://play.google.com/intl/en_us/badges/images/generic/es-play-badge-
border.png' style='width: 140px;'/></a>";
var iosLink = "<a href='https://apps.apple.com/us/app/app-
alternative/id765410001?itsct=apps_box_badge&amp;itscg=30200' style='display:
inline-block; overflow: hidden; border-radius: 13px; width: 140px; height:
40px;'><img src='https://tools.applemediaservices.com/api/badges/download-on-
the-app-store/black/es-es?size=250x83&amp;releaseDate=1381536000' alt='Descarga
en la App Store' style='border-radius: 13px; width: 140px; height:
40px;'></a>";
SupportDialog.setAlternativeAndroidAppLink(androidLink);
SupportDialog.setAlternativeIOSAppLink(iosLink);
AutoScript.cargarAppAfirma();
…
En caso de acceder a este despliegue desde un móvil Android, este código mostraría el siguiente
diálogo a los dos segundos de la llamada al método de carga:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
43
Ilustración 3 y 4 Diálogos de incompatibilidad con móvil y enlaces a apps alternativas
6.1.7.5 Estilo de los diálogos
Los diálogos de carga y error permiten configurar el estilo de cada uno de sus elementos. Para ello,
se proporcionan métodos con los que asignar a cada elemento una clase CSS con los estilos que se
deben aplicar al elemento. Los elementos personalizables del diálogo son los siguientes:
Ilustración 5 Elementos del diálogo de error
1
6
3
4
5
2
7
1
10

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
44
Ilustración 6 Elementos del diálogo de espera
Este tipo de diálogo aparecerá cuando ocurra un error relacionado con la conexión o instalación del
cliente, se puede personalizar con los siguientes métodos:
1. Fondo sobre el que se muestra el diálogo. Se puede configurar la clase CSS que define su
estilo mediante el método:
o setBackgroundClass(cssClassName)
2. Recuadro del diálogo. Se puede configurar la clase CSS que define su estilo mediante el
método:
o setDialogClass(cssClassName)
3. Recuadro con el logotipo del cliente establecido como fondo. Se puede configurar la clase
CSS que define su estilo mediante el método:
o setLogoClass(cssClassName):
4. Texto del mensaje de error. Se puede configurar la clase CSS que define su estilo mediante
el método:
o setErrorTextClass(cssClassName)
5. Botón de intento de la operación en los diálogos de error donde sea posible. Se puede
configurar la clase CSS que define su estilo mediante el método:
o setActionButtonClass(cssClassName)
6. Botón de cierre del diálogo de error. Se puede configurar la clase CSS que define su estilo
mediante el método:
o setCloseButtonClass(cssClassName)
7. Contenedor de los botones de acción. Se puede configurar la clase CSS que define su estilo
mediante el método:
o setButtonContainerClass(cssClassName)
8. Texto del diálogo de carga. Se puede configurar la clase CSS que define su estilo mediante el
método:
o setLoadingTextClass(cssClassName)
3
2
8
9
10

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
45
9. Cuadro con el icono de carga para la configuración de la imagen o animación de carga. Se
puede configurar la clase CSS que define su estilo mediante el método:
o setSpinnerClass(cssClassName)
10. Contenedor de los elementos del diálogo. Se puede configurar la clase CSS que define su
estilo mediante el método:
o setMessagePannelClass(cssClassName)
Por ejemplo, podemos definir en nuestra página los siguientes estilos para el diálogo, el logo y los
botones:
…
.customBackgroundClass {
position: fixed;
top: 0;
left: 0;
width: 100vw;
height: 100vh;
background: #08022ebb;
z-index: 9990;
display: flex;
align-items: center;
justify-content: center;
box-sizing: border-box;
}
.customDialogClass {
background-color: rgb(182, 234, 255);
position: fixed;
top: 30%;
left: 35%;
width: 30%;
max-width: 400px;
min-width: 280px;
padding: 20px;
border: 2px solid rgb(18, 5, 55);
border-radius: 15px;
box-shadow: 0 4px 13px 16px rgb(3 4 53/ 10%);
box-sizing: border-box;
}
.customLoadingTextClass {
margin-top: 10px;
font-family: Helvetica, Arial, sans-serif;
font-size: 20px;
color: #11022c;
text-align: center;
}
.customErrorTextClass {
margin-top: 10px;

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
46
font-family: Helvetica, Arial, sans-serif;
font-size: 15px;
color: #11022c;
text-align: center;
}
.customErrorTextClass a {
color: #292163;
text-decoration: underline;
cursor: pointer;
}
.customButtonContainerClass {
display: flex;
justify-content: flex-end;
gap: 10px;
margin-top: 20px;
}
.customActionButtonClass {
font-size: 20px;
font-family: sans-serif;
background-color: #292163;
color: white;
padding: 0 2rem;
border: 2px solid rgb(153, 123, 236);
border-radius: 8px;
cursor: pointer;
transition: background-color 0.2s ease;
}
.customActionButtonClass:hover {
background-color: #8b7cff;
color: #1f1b3b;
}
.customCloseButtonClass {
font-size: 20px;
font-family: sans-serif;
background-color: #21632d;
color: white;
padding: 8px 16px;
border: 2px solid rgb(5, 55, 27);
border-radius: 8px;
cursor: pointer;
transition: background-color 0.2s ease;
}
.customCloseButtonClass:hover {
background-color: #6fe985;
color: #1c4424;
}
.customLogoClass {

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
47
width: 80px;
height: 80px;
margin: 0 auto 15px auto;
background-image: url('img/custom_logo.png');
background-size: contain;
background-repeat: no-repeat;
background-position: center;
}
.customSpinnerClass {
width: 40px;
height: 40px;
margin: 15px auto 0 auto;
border: 4px solid rgba(0, 0, 0, 0.1);
border-top: 4px solid rgb(18, 5, 55);
border-radius: 50%;
animation: spin 1s linear infinite;
}
@keyframes spin {
from {
transform:rotate(0deg);
}
to {
transform: rotate(360deg);
}
}
…
Se puede aplicar esos estilos a los elementos del diálogo como sigue:
…
SupportDialog.setBackgroundClass("customBackgroundClass");
SupportDialog.setLogoClass("customLogoClass");
SupportDialog.setDialogClass("customDialogClass");
SupportDialog.setLoadingTextClass("customLoadingTextClass");
SupportDialog.setErrorTextClass("customErrorTextClass");
SupportDialog.setActionButtonClass("customActionButtonClass");
SupportDialog.setCloseButtonClass("customCloseButtonClass");
SupportDialog.setSpinnerClass("customSpinnerClass");
AutoScript.cargarAppAfirma();
…
El resultado sería el siguiente:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
48
Ilustración 7 y 8 Diálogos con estilo personalizado
6.2 Firma electrónica
La operación de firma electrónica nos permite generar la firma electrónica de unos datos, que pueden
haber sido proporcionados por la aplicación o seleccionados por el usuario.
Para ejecutar la operación de firma se utiliza la función JavaScript:
sign(dataB64, algorithm, format, params, successCb, errorCb);
En esta función:
• dataB64
o Datos que se desean firmar codificados en Base64.
▪ Si los datos que necesita firmar son un texto (texto plano, XML, JSON, etc), puede
convertirlos a Base64 por medio de las funciones de utilidad proporcionadas AutoScript,
descritas en el apartado 6.8.2 Conversión de un texto a cadena Base64.
o Si no se proporciona este parámetro (se usa null) o si se pasa una cadena vacía, Autofirma
mostrará al usuario un diálogo de selección de fichero para que seleccione el documento que
desea firmar.
▪ Salvo en casos concretos, no se recomienda dejar en manos del usuario la selección del
fichero a firmar. Incluso si es necesario hacerlo, se recomienda hacer que el usuario
cargue los datos previamente en servidor mediante un componente HTML y
seguidamente se realice una operación de firma trifásica.
▪ Para la compatibilidad con dispositivos móviles, nunca se deben proporcionar nulos o
cadena vacía.
• algorithm
o Algoritmo de firma. Consulte el apartado dedicado a los algoritmos de firma soportados para
el formato de firma que desee utilizar.
• format
o Formato de firma. Consulte el apartado 8 Formatos de firma para consultar aquellos
disponibles.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
49
• params
o Parámetros adicionales para la configuración de la operación de firma y características
particulares del formato de firma seleccionado.
▪ Si se introduce un nulo, se usará la configuración por defecto para el formato de firma
establecido.
▪ Consulte el apartado 7.1 Paso de parámetros adicionales para saber cómo realizar el paso
de parámetros y el apartado de información específica del formato de firma que desee
realizar para saber los parámetros soportados por el formato en cuestión.
• successCb
o Función callback JavaScript que se ejecutará una vez se obtenga el resultado de la operación
de firma. Esta función recibirá hasta tres parámetros:
1. En el primer parámero se recibe la firma resultante codificada en Base64.
2. En el segundo parámetro se recibe el certificado usado para firmar codificado en Base64.
3. En el tercer parámetro, opcionalmente, se recibirá un objeto JSON con el nombre del
fichero firmado (en caso de que lo haya seleccionado el usuario).
• errorCb
o Función callback JavaScript que se ejecutará cuando ocurra un error durante la operación de
firma. Esta función recibirá hasta dos parámetros:
1. En el primer parámetro se recibe un texto con el tipo del error.
2. En el segundo parámetro se recibe un texto con el mensaje de error.
A continuación, se muestran distintos ejemplos de firma electrónica:
• Firma electrónica de datos:
…
var dataB64 = "SG9sYSBNdW5kbyE="; // Datos a firmar
AutoScript.sign (dataB64, "SHA512", "CAdES",
"mode=implicit\nexpPolicy=FirmaAGE", successCallback,
errorCallback);
…
• Firma electrónica de un texto:
…
var dataB64 = AutoScript.getBase64FromText("Hola Mundo!!");
AutoScript.sign (dataB64, "SHA512", "XAdES", null, successCallback,
errorCallback);
…
• Firma electrónica cargando datos desde un fichero:
…

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
50
// Función que se ejecutará cuando la firma termine correctamente.
// Almacenara la firma, el certificado y el nombre del fichero firmado en
// campos de un formulario y lo enviará a servidor
function sendSignatureCallback (signatureB64, certificateB64, extraData) {
// Obtenemos el nombre del fichero cargado para
var filename = !!extraData ? extraData.filename : null;
document.getElementByName("signatureField").value = signatureB64;
document.getElementByName("certificateField").value = certificadteB64;
if (filename) {
document.getElementByName("filenameField").value = filename;
}
document.getElementByName("formulario").submit();
}
// Funcion que se ejecutara cuando el proceso de firma falle
function showErrorCallback (type, message) {
showError(message); // Funcion de la aplicación para mostrar errores
}
…
// Llamamos a la operacion de firma
AutoScript.sign (null, "SHA512", "CAdES", null, sendSignatureCallback,
showErrorCallback);
…
Es importante recalcar que la aplicación que solicita la firma no sabrá del resultado de la operación
hasta que AutoScript invoque a la función callback de éxito o de error. Es probable que no se desee
que el usuario interaccione de ninguna manera con la aplicación hasta haber finalizado la firma, por
lo que se recomienda que se le muestre un mensaje de espera justo antes de llamar a la operación
de firma (pudiendo incluso bloquear la posibilidad de interaccionar con la interfaz de la aplicación).
Este mensaje no debería retirarse hasta recibir una respuesta de la aplicación, por lo que se eliminaría
en las funciones callback de éxito y de error. A partir de entonces, el usuario podría navegar de nuevo
libremente.
La espera de la aplicación a la respuesta de Autofirma debería aplicarse a cualquier operación de
firma, cofirma, contrafirma o firma de lote y es especialmente importante cuando se fueza el modo
de comunicación entre la aplicación y Autofirma sea a través de servidor intermedio o cuando se
desea que nuestra aplicación sea compatible con las aplicaciones móviles.
6.2.1 Firma de múltiples documentos (firma masiva)
Para firmar más de un documento, se podría utilizar múltiples veces al método de firma o se podría
procesar todo en una única operación:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
51
• La opción de llamar múltples veces al método de firma es la que se describe en este apartado,
pero tiene el inconveniente de no ser compatible con dispositivos móviles ni cuando en PC
se decida forzar el uso de los servidores auxiliares (descrito en el apartado 6.1.3 Forzado de
la comunicación a través de los servicios auxiliares).
• La opción de la firma en lote se describe en el apartado 6.5 Firma de lotes predefinidos. Este
modo es compatible con todos los entornos y modos de comunicación, pero requiere el
despliegue del servidor trifásico y la configuración de un gestor de documento en servidor.
Cuando se deseen firmar multiples datos llamando a la operación de firma simple de Autofirma debe
tenerse en cuenta un aspecto importante: la ejecución de las operaciones debe realizarse siempre
secuencialmente, nunca en paralelo. Es decir, no enviaremos a firmar un dato hasta no haber recibido
el resultado de una operación anterior.
El modo común y recomendado de realizar la firma secuencial de múltiples documentos es solicitar
la firma de un documento en la función callback en la que se recibe el resultado de la operación
anterior.
Un ejemplo de uso es:
// Posicion del elemento que se esta procesando
var idx = 0;
// Array con los valores a firmar
var dataArray = [ "UHJpbWVyIGRhdG8gZGUgcHJ1ZWJh",
"U2VndW5kbyBkYXRvIGRlIHBydWViYQ==",
"VGVyY2VyIGRhdG8gZGUgcHJ1ZWJh",
"Q3VhcnRvIGRhdG8gZGUgcHJ1ZWJh"
];
// Iniciamos la firma del primer dato a firmar
AutoScript.setStickySignatory(true);
AutoScript.sign( dataArray[idx],
"SHA512",
"CAdES",
paramsParam,
successCallback,
showErrorCallback);
…
// Función callback a ejecutar cuando termine correctamente una firma
function successCallback (signatureB64) {
// Procesamos la firma
…
// Mandamos a firmar el siguiente dato (si quedase alguno)
++idx;
if (idx < dataArray.length) {
AutoScript.sign( dataArray[idx],
"SHA512",

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
52
"CAdES",
paramsParam,
successCallback,
showErrorCallback);
}
else {
// Ya se han generado todas las firmas
…
}
}
// Función callback a ejecutar cuando falle la firma
function showErrorCallback (errorType, errorMsg) {
// Mostramos el error
alert(“Error durante la firma de un documento. Se interrumpirá el
proceso de firma.”);
}
Para posibilitar que el usuario sólo deba seleccionar el certificado de firma en una ocasión y no para
operación individual, se deberá dejar prefijado este certificado mediante el método:
setStickySignatory (sticky);
En esta función:
• sticky
o Indica si se debe fijar el siguiente certificado que se utilice.
▪ Si se indica el valor “true”, el próximo certificado que seleccione mediante un filtro o
que seleccione directamente el usuario (en una operación de firma o selección de
certificado) quedará fijado y se utilizará para todas las operaciones posteriores.
▪ Si se indica el valor false, se libera el certificado y se volverá a solicitar al usuario en
cada una de las siguientes operaciones.
Esta función no devuelve nada y sólo es compatible con Autofirma. En una operación de firma con
Autofirma App, el usuario deberá seleccionar el certificado por cada operación de firma individual.
Al realizar múltiples firmas con tarjetas inteligentes, es posible que se pida el PIN de la tarjeta por
cada operación individual, según sea el comportamiento definido por el controlador de la propia
tarjeta. En caso de usarse una tarjeta CERES o el DNIe, el controlador será JMulticard y este mostrará
en el diálogo de selección de PIN una casilla que podrá seleccionarse para que la aplicación recuerde
el PIN y no lo vuelva a solicitar si se ha llamado a la función “setStickySignatory()” con el valor
“true”.
Adicionalmente, para la generación de multifirmas dentro de un procedimiento masivo es interesante
indicar el valor “AUTO” como formato de firma. Al hacerlo, las cofirmas y contrafirmas se realizarán

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
53
en el mismo formato que la firma sobre la que se opera. El valor “AUTO” no es válido para firmas
simples. Puede saber más sobre esta opción en el apartado 8 Formatos de firma.
Otra alternativa para firmar múltiples documentos es la operación de 6.5 Firma de lotes predefinidos.
6.2.2 Firma trifásica
Una operación de firma requiere preparar la estructura de la firma conforme el formato de firma
seleccionado, cifrar con la clave privada del certificado del usuario parte de esa estructura e introducir
esos datos cifrados dentro de la misma estructura. Habitualmente, estos tres pasos se ejecutan de
forma conjunta en Autofirma y por eso decimos que la firma se ha ejecutado en una única fase
(monofásica).
Una alternativa a lo anterior sería separar estos tres pasos y delegar en un servidor aquello que no
requiera datos del usuario. Así, preparar la estructura e introducir los datos cifrados en ella (fases 1 y
3) se puede realizar en servidor, mientras que el cifrado de los datos con la clave privada del
certificado del usuario se realizaría en local (la clave del certificado nunca sale del equipo del usuario).
Este mecanismo en tres pasos es lo que se denomina firma trifásica.
Las firmas realizadas por Autofirma se realizan, por defecto, de forma monofásica. Sin embargo, el
Autofirma también permite realizar las firmas de forma trifásica y Autofirma App las realizarán casi
en todos los casos de este modo.
Las operaciones de firma trifásicas ayudan a reducir el envío de información entre Autofirma y el
servidor cuando los datos a firmar se encuentran en servidor y/o cuando la firma generada por el
usuario va a enviarse a ese servidor. Sin embargo, ya que parte de la operación trifásica se realiza en
servidor, puede suponer un problema si se recibe un volumen de peticiones mayor al que puede
procesar, ya que aumentan sus necesidades de memoría y procesador.
La realización de firmas trifásicas requiere el despliegue del servicio de firma trifásica descrito en el
apartado 5.3.2 Servicios de firma trifásica y firma de lotes. Así mismo, se deberán cumplir las
siguientes condiciones en la operación de firma:
• Se podrá proporcionar una referencia a los datos a firmar en lugar de los propios datos. El
tipo de referencia variará según la clase gestora de documentos configurada en el servicio de
firma trifásica. Con la clase gestora por defecto se seguirán requiriendo los propios datos.
• Se usará el nombre del formato de firma trifásica en lugar del nombre de formato tradicional:
o Para firmas CAdES: CAdEStri
o Para firmas XAdES: XAdEStri
o Para firmas PAdES: PAdEStri
o Para firmas de factura electrónica: FacturaEtri
NOTA: En Autofirma App se realizará firma trifásica indepedencientemente de que se use el
nombre monofásico del formato cuando la aplicación cliente no soporte su generación
monofásica.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
54
• Se configurará el parámetro adicional “serverUrl” con la URL del servicio de firma trifásica.
Para saber más de los parámetros adicionales de configuración consulte el apartado 7.1 Paso
de parámetros adicionales.
Un ejemplo de operación de firma trifásica sería:
…
// Configuramos una firma CAdES trifásica implicita
var params = "mode=implicit\nserverUrl=https://servidor.com/afirma/afirma-
server-triphase-signer/SignatureService";
AutoScript.sign (dataRefB64, "SHA512", "CAdEStri", params,
showSignResultCallback, showErrorCallback);
…
El proceso trifásico de firma se encuentra disponible para las operaciones de firma, cofirma y
contrafirma.
Consulte más información sobre la operativa interna del proceso de firma trifásica en el apartado
ANEXO II Firma trifásica.
6.3 Cofirma electrónica
La cofirma es la operación mediante la cual se agrega una nueva firma a una firma previa. La firma
generada está al mismo nivel que la firma original. Esta sería la operación mediante la cual dos o más
firmantes muestran su acuerdo con un documento.
La cofirma consiste en agregar la información de firma de un firmante a una firma ya existente. Así,
será necesario que una persona firme el documento generando así la información de firma. El
segundo firmante deberá cofirmar la firma generada por el primer firmante, el tercero cofirmará la
firma generada por el segundo y así sucesivamente. Esta operación se puede realizar por entero en
el lado cliente o a través del proceso de firma trifásica descrito en el ANEXO II Firma trifásica.
La función JavaScript mediante la cual se realizan las cofirmas es:
cosign(signB64, algorithm, format, params, successCb, errorCb);
En esta función:
• signB64
o Firma electrónica que se desea cofirmar codificada en Base64.
▪ Una firma en Base64 puede ser el resultado obtenido por cualquier
operación de firma, cofirma o contrafirma previa.
o Si no se proporciona este parámetro (se usa null) o si se pasa una cadena vacía,
Autofirma mostrará al usuario un diálogo de selección de fichero para que seleccione
el fichero de firma que desea cofirmar.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
55
▪ Salvo en casos concretos, no se recomienda dejar en manos del usuario la
selección del fichero de firma. Incluso si es necesario hacerlo, se recomienda
hacer que el usuario cargue la firma previamente en servidor mediante un
componente HTML y seguidamente se realice una operación de cofirma
trifásica.
▪ Para la compatibilidad con dispositivos móviles, nunca se deben
proporcionar nulos o cadena vacía.
• algorithm
o Algoritmo de firma. Consulte el apartado dedicado a los algorirmos de firma
soportados para el formato de firma que desee utilizar.
• format
o Formato de firma. Consulte el apartado 8 Formatos de firma para consultar aquellos
disponibles.
▪ Si no conoce el formato de firma utilizado en la firma original, indique el valor
“AUTO” para especificar que se utilice el mismo formato que la firma original.
▪ Por norma general, no se puede cofirmar una firma en un formato distinto al
que se usó para generar dicha firma.
• params
o Parámetros adicionales para la configuración de la operación de cofirma y
características particulares del formato de firma seleccionado.
▪ Si se introduce un nulo, se usará la configuración por defecto para el formato
de firma establecido.
▪ Consulte el apartado 7.1 Paso de parámetros adicionales para saber cómo
realizar el paso de parámetros y el apartado de información específica del
formato de firma que desee realizar para saber los parámetros soportados
por el formato en cuestión.
• successCb
o Función callback JavaScript que se ejecutará una vez se obtenga el resultado de la
operación de cofirma. Esta función recibirá hasta tres parámetros:
1. En el primer parámero se recibe la firma resultante codificada en Base64.
2. En el segundo parámetro se recibe el certificado usado para cofirmar codificado
en Base64.
3. En el tercer parámetro, opcionalmente, se recibirá un objeto JSON con el nombre
del fichero de firma cofirmado en caso de que lo haya seleccionado el usuario.
• errorCb
o Función callback JavaScript que se ejecutará cuando ocurra un error durante la
operación de firma. Esta función recibirá hasta dos parámetros:
1. En el primer parámetro se recibe un texto con el tipo del error.
2. En el segundo parámetro se recibe un texto con el mensaje de error.
A continuación, se muestran distintos ejemplos de operaciones de cofirma:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
56
• Cofirma electrónica de una firma ya cargada:
…
var signatureB64 = … // Firma electrónica a cofirmar
AutoScript.cosign(signatureB64, “SHA512”, “AUTO”, null, successCallback,
errorCallback);
…
• Cofirma electrónica cargando una firma desde un fichero:
…
AutoScript.cosign(null, “SHA512”, “XAdES”, null, successCallback,
errorCallback);
…
• Cofirma electrónica del resultado de una firma:
…
// Funcion que realiza la cofirma a partir de los datos de firma
function cosignCallback (signatureB64) {
AutoScript.cosign(
signatureB64, “SHA512”, “XAdES”, null, sendDataCallback,
showErrorCallback
);
}
…
// Función que almacena los datos generados por la cofirma en el campo
// “resultId” de un formulario y lo envia
function sendDataCallback (cosignB64, certificateB64) {
document.getElementById(“resultId”).value = cosignB64;
document.getElementById(“firmante”).value = certificateB64;
document.getElementById(“formulario”).submmit();
}
…
// Función para firmar datos. Si termina correctamente la operación de firma
// se llama a la función “cosignFunction” con el resultado de la operación y,
// si ésta también termina correctamente, se llama a la función
// “saveDataFunction” con el resultado de la cofirma. Si falla alguna de
// estas funciones se llama al método “showError”
function firmar(dataB64) {
AutoScript.sign(dataB64, “SHA512”, “XAdES”, “format=XAdES Detached”,
cosignCallback, showErrorCallback);
}
…

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
57
6.4 Contrafirma electrónica
La contrafirma es la operación mediante la cual se refrenda una firma electrónica previa. En términos
generales, es el firmar una firma electrónica. Este es el tipo de operación que realizaría un organismo,
por ejemplo, como prueba de registro de una firma electrónica en su sistema.
La contrafirma no es una operación que soporten todos los formatos de firma. Consulte el apartado
dedicado a los algorirmos de firma soportados para el formato de firma que desee utilizar.
La contrafirma se puede realizar por entero en el lado cliente o a través del proceso de firma trifásica
descrito en el ANEXO II Firma trifásica.
La función JavaScript mediante la cual se realizan las contrafirmas es:
countersign(signB64, algorithm, format, params, successCb, errorCb);
En esta función:
• signB64
o Firma electrónica que se desea contrafirmar codificada en Base64.
▪ Una firma en Base64 puede ser el resultado obtenido por cualquier
operación de firma, cofirma o contrafirma previa.
o Si no se proporciona este parámetro (se usa null) o si se pasa una cadena vacía,
Autofirma mostrará al usuario un diálogo de selección de fichero para que seleccione
el fichero de firma que desea contrafirmar.
▪ Salvo en casos concretos, no se recomienda dejar en manos del usuario la
selección del fichero de firma. Incluso si es necesario hacerlo, se recomienda
hacer que el usuario cargue la firma previamente en servidor mediante un
componente HTML y seguidamente se realice una operación de cofirma
trifásica.
▪ Para la compatibilidad con dispositivos móviles, nunca se deben
proporcionar nulos o cadena vacía.
• algorithm
o Algoritmo de firma. Consulte el apartado dedicado a los algorirmos de firma
soportados para el formato de firma que desee utilizar.
• format
o Formato de firma. Consulte el apartado 8 Formatos de firma para consultar aquellos
disponibles.
▪ Si no conoce el formato de firma utilizado en la firma original, indique el valor
“AUTO” para especificar que se utilice el mismo formato que la firma original.
▪ Por norma general, no se puede contrafirmar una firma en un formato
distinto al que se usó para generar dicha firma.
• params

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
58
o Parámetros adicionales para la configuración de la operación de contrafirma y
características particulares del formato de firma seleccionado.
▪ Si se introduce un nulo, se usará la configuración por defecto para el formato
de firma establecido.
▪ La operación de contrafirma admite un parámetro adicional concreto para
configurar qué firmas dentro del fichero de firma se quieren contrafirmar.
Consulte el apartado 6.4.1 Selección de nodos para más detalle.
▪ Consulte el apartado 7.1 Paso de parámetros adicionales para saber cómo
realizar el paso de parámetros y el apartado de información específica del
formato de firma que desee realizar para saber los parámetros soportados
por el formato en cuestión.
• successCb
o Función callback JavaScript que se ejecutará una vez se obtenga el resultado de la
operación de cofirma. Esta función recibirá hasta tres parámetros:
1. En el primer parámero se recibe la firma resultante codificada en Base64.
2. En el segundo parámetro se recibe el certificado usado para cofirmar codificado
en Base64.
3. En el tercer parámetro, opcionalmente, se recibirá un objeto JSON con el nombre
del fichero de firma cofirmado en caso de que lo haya seleccionado el usuario.
• errorCb
o Función callback JavaScript que se ejecutará cuando ocurra un error durante la
operación de firma. Esta función recibirá hasta dos parámetros:
1. En el primer parámetro se recibe un texto con el tipo del error.
2. En el segundo parámetro se recibe un texto con el mensaje de error.
A continuación, se muestran distintos ejemplos de contrafirma:
• Contrafirma electrónica de una firma
…
var signatureB64 = … // Firma electrónica a cofirmar
AutoScript.countersign(signatureB64, “SHA512”, “AUTO”, “target=true”,
successCallback, errorCallback);
…
• Contrafirma electrónica del resultado de una firma
…
// Funcion callback que desencadena la operación de contrafirma
function counterSignCallback (signatureB64) {
AutoScript.countersign(
signatureB64, “SHA512”, “XAdES”, null,

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
59
successCallback, errorCallback
);
}
…
// Iniciamos la operacion de firma que después se contrafirmará
AutoScript.sign(
dataB64, “SHA512”, “XAdES”, null, counterSignCallback,
errorCallback);
…
6.4.1 Selección de nodos
La operación de contrafirma se realiza sobre una firma. Esta puede ser una firma simple, una cofirma
u otra contrafirma. Estas operaciones de firma, cofirma y contrafirma van agregando firmas a un
documento y, ya que las contrafirmas se realizan sobre firmas previas, se forma lo que se ha dado en
llamar “árbol de firmas”. Así, por ejemplo, después de realizar varias cofirmas y contrafirmas sobre
una firma se podría obtener una estructura como la siguiente:
En esta estructura se refleja que se han firmado los datos dos veces (firma y cofirma) y que una de
esas firmas tiene una contrafirma. Debe tenerse en cuenta que las firmas y las cofirmas son
equivalentes (ambas firman los datos) y por tanto ambas se pueden considerar cofirmas entre sí.
En relación a esto, Autofirma permite configurar que las contrafirmas se realicen según una de las
siguientes políticas de firma:
• Firma de nodos hoja del árbol (LEAFS): Se firmarán sólo las firmas del árbol que no tienen
ninguna contrafirma.
• Firma de todo el árbol de firma (TREE): Se firman todas las firmas del árbol.
La configuración de qué nodos se desean firmar se realiza a través del parámetro params de la
función de contrafirma, al que, además de toda la configuración específica del formato de firma, se
le puede agregar la propiedad target con la política de selección de nodos. Los valores que admite
esta propiedad son:
• leafs
o Contrafirma todas las firmas que sean nodos hoja del árbol. Este es el valor por
defecto.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
60
• tree
o Contrafirma todas las firmas del árbol.
Por ejemplo, si tomamos como base la estructura de firma anterior, así quedaría al contrafirmarla
con cada uno de los parámetros adminitidos:
• target=leafs
• target=tree
6.5 Firma de lotes predefinidos
Autofirma incorpora una funcionalidad de firma de lotes de documentos, lo que permite a las
aplicaciones enviar a firmar un grupo de datos en una única llamada. Esta operación permite que se
pueda ordenar la firma de todos los documentos en una sola llamada al cliente de firma y que el
usuario pueda seleccionar el certificado de firma una única vez.
Las firmas de un lote de firma se realizan de forma trifásica, lo cual se traduce en que buena parte
del proceso de firma se realiza en servidor y es necesario utilizar los servicios del WAR “afirma-
server-triphase-signer.war”. Consulte el apartado 5.3.2 Servicios de firma trifásica y firma de
lotes para saber más sobre el despliegue y configuración de este servicio.
Al igual que ocurre con las firmas trifásicas, el sistema de firma de lotes permite que tanto el origen
de los datos como el destino de la firma estén en servidor. Este origen y destino se determina por
medio de un gestor de documentos configurado en el servicio de firma trifásica. En los lotes de firma
no tienen porqué agregarse el contenido de los documentos a firmar, se puede (y se debería) agregar
la referencia a esos documentos y que sea el servidor el encargado de acceder a ellos para firmarlos

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
61
y después guardar la firma. Esto lo hace el servicio de firma trifásica a través de la clase a la que
llamamos “gestor de documentos”. Estos gestores de documentos son los mismos utilizados para las
operaciones de firma trifásica. El servicio de firma trifásica incluye varios gestores de documentos
genéricos y permite que se le agreguen otros desarrollados expresamente para cualquier entorno (la
opción recomendada). Consulte el ANEXO II Firma trifásica para saber más sobre los gestores de
documentos disponibles y cómo desarrollar el suyo propio.
Es importante entender que la aplicación que solicita la firma de un lote recibe como resultado el
listado de resultados de las firmas generadas, es decir, si terminaron bien o mal, pero no las propias
firmas. Las firmas se deben procesar o almacenar en servidor y esto se hará mediante el gestor de
documentos configurado. Tenga en cuenta que el valor de retorno del gestor de documentos después
de procesar la firma no se utiliza en la firma de lotes, por lo que el gestor de documentos configurado
por defecto (SelfishDocumentManager) no devuelve las firmas (ni hace nada con ellas, así que
este nunca se debe usar con la firma de lotes) y el gestor de muestra que guarda en disco
(FileSystemDocumentManager) no proporciona el nombre del fichero de salida. Es necesario
configurar un gestor acorde a nuestra lógica de negocio, preferiblemente creado para tal fin tal como
se describe en el apartado II.1.2 Gestores de documentos personalizados.
Generar una firma de lote con Autofirma requiere de tres pasos:
1. Crear un lote de firma con la configuración de firma que deberá aplicarse sobre cada uno de
los documentos a firmar.
2. Agregar los documentos (referencias a los datos) al lote. Si un documento del lote tuviese
que firmarse con una configuración distinto a la del resto, se podría proporcionar una
configuración específica para él.
3. Enviar a firmar el lote. Esto conlleva la llamada a Autofirma y definir los métodos callback que
se deberán ejecutar en caso de que se complete la firma del lote o si se produce un error
bloqueante durante su procesado.
6.5.1 Creación del lote
Para la creación del lote de firma se llamará al método JavaScript:
createBatch (algorithm, format, suboperation, extraparams)
Este método creaa el lote y establece la configuración de firma que se aplicará por defecto a cada
uno de los documentos que se agregue al mismo.
Al agregar documentos al lote se podrá establecer una configuración específica para su firma, salvo
para el algoritmo de firma. El algoritmo indicado en el método de creación del lote será el utilizado
para firmar todos los documentos del lote.
Los parámetros utilizados en este método son los siguientes:
• algorithm

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
62
o Indica el algoritmo de firma a usar para todo el lote. Los valores permitidos son:
▪ SHA256
▪ SHA384
▪ SHA512
▪ SHA1 (No se recomienda su uso por obsoleto)
• format
o Indicar el formato de firma que se usará por defecto para los documentos del lote.
Los valores permitidos son:
▪ CAdES
▪ XAdES
▪ PAdES
▪ FacturaE
▪ NONE
o A pesar del nombre del formato, todas las firmas se realizarán de forma trifásica.
• suboperation
o Indica la operación de firma a realizar por defecto. Los valores permitidos son:
▪ sign
▪ Firma.
▪ cosign
▪ Cofirma.
▪ countersign
▪ Contrafirma.
• extraparams
o Cadena con el listado de propiedades que configurarán las firmas por defecto.
o Se compondrá de una serie de tuplas “CLAVE=VALOR” separadas por “\n”, en donde
la CLAVE será la propiedad a configurar y VALOR el valor asignado. Por ejemplo:
“mode=implicit\nsignerClaimedRoles=Adjudicatario|Responsable\n
signatureProductionCity=Madrid”
o Las propiedades admitidas por cada uno de los formatos de firma se indican en los
siguientes apartados:
▪ 8.1.3 Parámetros adicionales para las firmas CAdES.
▪ 8.2.7 Parámetros adicionales para las firmas XAdES.
▪ 8.3.8 Parámetros adicionales para las firmas PAdES.
▪ 8.4.3 Parámetros adicionales para las firmas FacturaE.
6.5.2 Agregar documentos al lote
Para agregar documentos al lote se utilizará el método:
addDocumentToBatch (id, datareference, format, suboperation,
extraparams)

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
63
Este método agrega al lote un documento a firmar, pudiendo definir una configuración específica
para firmar con él u omitir esta configuración para utilizar la configuración por defecto establecida
durante la creación del lote. El algoritmo de firma siempre será el establecido durante la creación del
lote.
Los parámetros utilizados en este método son los siguientes:
• id
o Identificador con el que referenciar el documento. Cuando se devuelva el resultado
de la firma del lote, se podrá saber cual ha sido el resultado de la firma de este
documento porque vendrá referenciado con este mismo identificador.
o Esta propiedad es obligatoria y no puede ser el mismo para dos documentos del lote.
• datareference
o Referencia a los datos a firmar. El tipo de referencia depende del gestor de
documentos configurado en el servicio de firma trifásica.
o Por ejemplo:
▪ Con el gestor DefaultDocumentManager, la referencia debe ser el propio
documento codificado en Base 64.
▪ Con el gestor FileSystemDocumentManager, la referencia indicada en
este parámetro sería un nombre de fichero y el servicio de firma se
encargaría de cargar ese fichero del directorio configurado en el servidor.
▪ Con el gestor LegacyBatchDocumentManager, la referencia podría ser el
propio documento en Base 64 o una URL. Si fuese el documento en Base 64,
el servicio sólo tendría que decodificarlo, y si fuese una URL, el servicio
accedería a la misma para descargar los datos.
o Un desarrollador puede (y debería) agregar nuevos gestores de documentos al
servicio de firma trifásica para optimizar la integración con sus sistemas. Por ejemplo,
si los documentos se guardan en un repositorio de documentos, se podría crear un
gestor de documentos que recibiese el identificador con el que se referencia al
documento en el gestor y obtenerlo del mismo. Consulte el anexo II.1.2 Gestores de
documentos personalizados para conocer como crear y configurar su propio gestor
de documentos.
• format
o Formato de firma a utilizar para este documento particular. Si no se indica ninguno,
se usará el que se indicó en el método createBatch.
o Los formatos permitidos son:
▪ CAdES
▪ XAdES
▪ PAdES
▪ FacturaE
▪ NONE

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
64
o A pesar del nombre del formato, todas las firmas se realizarán de forma trifásica.
• suboperation
o Indica la operación de firma a aplicar sobre este documento. Si no se indica ninguna,
se usará la que se indicó en el método createBatch.
o Los valores permitidos son:
▪ sign
▪ Firma.
▪ cosign
▪ Cofirma.
▪ countersign
▪ Contrafirma.
• extraparams
o Cadena con el listado de propiedades que configurarán esta firma particular. Si no se
indica ninguna, se usará la que se indicó en el método createBatch.
o Se compondrá de una serie de tuplas “CLAVE=VALOR” separadas por “\n”, en donde
la CLAVE será la propiedad a configurar y VALOR el valor asignado. Por ejemplo:
“mode=implicit\nsignerClaimedRoles=Adjudicatario|Responsable\n
signatureProductionCity=Madrid”.
o Las propiedades admitidas por cada uno de los formatos de firma se indican en los
siguientes apartados:
▪ 8.1.3 Parámetros adicionales para las firmas CAdES.
▪ 8.2.7 Parámetros adicionales para las firmas XAdES.
▪ 8.3.8 Parámetros adicionales para las firmas PAdES.
▪ 8.4.3 Parámetros adicionales para las firmas FacturaE.
6.5.3 Firma del lote
Para iniciar el proceso de firma del lote se usará el método:
signBatchProcess (stopOnError, batchPreSignerUrl, batchPostSignerUrl,
certFilters, successCallback, errorCallback)
Este método inicia el proceso de firma del lote y establece una serie de parámetros necesarios para
su funcionamiento.
Los parámetros utilizados en este método son los siguientes:
• stopOnError
o Indica si la firma del lote debería detenerse en el momento en el que se encuentre
que una firma no es válida. Esto es útil cuando se dé el caso en el que se deseen
firmar todos los documentos o ninguno.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
65
o Cuando se establece a “false” se indica que el proceso debe continuar incluso si
alguna de las firmas del lote no puede completarse, y cuando se establece a “true”
el proceso se para en el momento en el que se produce el primer error.
o Cuando se establece a “true”, no se guardará ninguna firma generada hasta que no
se hayan generado todas. En caso de error no se guardará ninguna. Si fallase el
guardado de una firma, se ejecutaría el método rollback() del gestor de
documentos sobre cada una de las firmas ya guardadas para deshacer este guardado.
• batchPreSignerUrl
o URL del servicio de prefirma de lotes.
o Este servicio se despliega junto con el servicio de firma trifásica y, por defecto, tendrá
el nombre presign.
o Por ejemplo:
▪ https://servidor.gob.es/aplicacion/afirma-server-
triphase-signer/presign
• batchPostSignerUrl
o URL del servicio de postfirma de lotes.
o Este servicio se despliega junto con el servicio de firma trifásica y, por defecto, tendrá
el nombre postsign.
o Por ejemplo:
▪ https://servidor.gob.es/aplicacion/afirma-server-
triphase-signer/postsign
• certFilters
o Permite definir los filtros para determinar qué certificados se pueden utilizar para
firmar. Esta propiedad es opcional.
o Se compondrá de una serie de tuplas “CLAVE=VALOR” separadas por “\n”, en donde
la CLAVE será la propiedad que se va a configurar y VALOR el valor asignado. Por
ejemplo: “filters=
subject.contains:Juan;nonexpired:true\nmandatoryCertSelection=
false”.
o Las propiedades admitidas son las propiedades de filtros descritas en el apartado 7.3
Configuración de los filtros de certificados y la propiedad
mandatoryCertSelection del apartado 7.4 Selección automática de certificados.
• successCallback
o Método callback JavaScript que se debe ejecutar en caso de que se complete la firma
del lote.
o Si no se configura que se detenga el proceso en caso de error mediante el parámetro
stopOnError, este método se llamará incluso si falla alguna de las firmas del lote.
En ese caso, únicamente se devolverá en el listado de resultados que esa firma
produjo un error.
o Esta función recibirá como parámetros:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
66
1. Una estructura JSON con el resultado de cada firma del lote. En el caso de
que fallase una firma, se indica una descripción del error que se produjo. No
se reciben las firmas generadas, el destino de estas es determinado por el
gestor de documentos configurado en servidor.
2. El certificado utilizado para firmar codificado en Base64.
• errorCallback
o Método callback JavaScript que se debe ejecutar en caso de que no se pueda
procesar la firma del lote o si falla alguna de las firmas cuando se indica que debe
deternerse el proceso de firma en caso de error.
o Esta función recibirá dos parámetros:
1. El tipo de error producido.
2. Un texto descriptivo del error.
6.5.3.1 Resultado de la firma del lote
Cuando se termina de procesa correctamente un lote de firma, el cliente recibe como respuesta en
el método callback de éxito una estructura JSON que describe como ha resultado el proceso.
Esta estructura JSON es acorde al siguiente esquema:
{
"$schema": "http://json-schema.org/draft-04/schema#",
"type": "object",
"properties": {
"signs": {
"type": "array",
"items": [
{
"type": "object",
"properties": {
"id": {
"type": "string"
},
"result": {
"type": "string"
},
"description": {
"type": "string"
}
},
"required": [
"id",
"result"
]
}
]
}
},
"required": [
"signs"
]
}

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
67
Un ejemplo de JSON devuelto podría ser el siguiente:
{
"signs":[
{"id":"7725374e-728d-4a33-9db9-3a4efea4cead",
"result":"DONE_AND_SAVED"
}
,
{"id":"93d1531c-cd32-4c8e-8cc8-1f1cfe66f64a",
"result":"DONE_BUT_ERROR_SAVING",
"description":"java.io.IOException: No se pudo guardar el fichero"
}
]
}
En él distinguimos un elemento “signs” con el listado de firmas del lote. Cada uno de estos elementos
tiene los siguientes atributos:
• id
o Identificador del documento al cual corresponde el resultado. Los identificadores
serán los mismos utilizados al agregar los documentos al lote. Debe tenerse en
cuenta que los resultados pueden no estar listados en el el mismo orden en el que se
agregaron los documentos al lote. Por eso es importante usar este ID para asociar
cada documento firmado a su resultado.
• result
o Resultado de realizar la firma. Esta propiedad puede adoptar uno de entre los
siguientes estados:
▪ Estado de éxito
• DONE_AND_SAVED
o La firma se generó y procesó correctamente.
▪ Estados de error
• DONE_BUT_ERROR_SAVING
o Error al guardar la firma.
• ERROR_PRE
o Error en la primera fase del proceso de firma trifásica.
• ERROR_POST
o Error en la tercera fase del proceso de firma trifásica.
▪ Estados intermedios
• NOT_STARTED
o La firma no se ha iniciado.
• DONE_BUT_NOT_SAVED_YET

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
68
o La firma se ha generado, pero aún no se ha guardado.
• DONE_BUT_SAVED_SKIPPED
o La firma se generó correctamente pero no se guardará.
• SKIPPED
o No se realizará la firma.
• SAVE_ROLLBACKED
o La firma se guardó, pero se volvió a eliminar.
o En el caso de que no se indique que el proceso se interrumpa al detectar un error en
una firma, todas las firmas aparecerán con el estado de éxito como resultado o con
alguno de los resultados de error.
o En el caso de que sí se indique que el proceso se interrumpa, cuando se detecte un
error las firmas pueden quedar en alguno de los estados intermedios.
• description
o Descripción del resultado del proceso (opcional). Se utiliza para ampliar información
cuando se devuelve un estado de error.
Cuando se obtiene el resultado DONE_AND_SAVED en una firma de un lote, se sabe que la firma se ha
generado y se ha procesado correctamente según lo establece el gestor de documentos configurado
en el servicio de firma trifásica.
6.5.4 Ejemplo de operación de firma de lote
Aquí se incluye un ejemplo de código JavaScript que ejecuta una operación de firma de lote:
// Método callback para procesar el resultado del lote
function exitoCallback(result, certB64) {
// Mostramos por consola el resultado de cada firma
for (var i = 0; i < result.signs.length; i++) {
console.log("Id: " + result.signs[i].id
+ ". Result: " + result.signs[i].result
+ ". Description: " + result.signs[i].description);
}
}
// Método callback para tratar los errores
function errorCallback(errorType, errorMessage) {
// Mostramos por consola el error producido
console.log("Tipo: " + errorType + "\nMensaje: " + errorMessage);
}
// Método de firma
function firmarLote() {
// Creamos lote con el algoritmo de firma y una configuración de firma
// por defecto
AutoScript.createBatch("SHA512", "CAdES", "sign", "mode=implicit");

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
69
// Definimos las referencias a los datos. En este caso, usaremos nombres de
// ficheros codificados en Base64, ya que en el servicio de firma trifásica
// tendríamos configurado el gestor de documentos FileSystemDocumentManager
var ref1 = Base64.encode("Entrada.txt");
var ref2 = Base64.encode("Firma_cades.csig");
var ref3 = Base64.encode("Entrada.pdf");
var ref4 = Base64.encode("Entrada.jpg");
// Agregamos los documentos al lote, estableciendo parámetros de
// configuración particulares para los documentos que queramos
AutoScript.addDocumentToBatch("1", ref1);
AutoScript.addDocumentToBatch("2", ref2, "CAdES", "cosign", "mode=explicit");
AutoScript.addDocumentToBatch("3", ref3, "PAdES");
AutoScript.addDocumentToBatch("4", ref4, "XAdES", "sign", "format=XAdES
Detached\nsignatureProductionCountry=España\nsignatureProductionCity=Madrid");
// Enviamos a firmar el lote
var baseUrl = "https://servidor.gob.es/afirma-server-triphase-signer/"
AutoScript.signBatchProcess(false, baseUrl + "presign", baseUrl + "postsign",
"filters=nonexpired:true\nmandatoryCertSelection=false", exitoCallback,
errorCallback);
}
6.5.5 Firma de lotes sin servidor (monofásica)
A pesar de que el funcionamiento normal de la firma de lotes es trifásico (los datos y las firmas se
procesan en servidor), es posible configurar el despliegue para que Autofirma haga la firma de los
datos en local y devuelva directamente las firmas generadas. Este modo de funcionamiento está
orientado a aquellas operaciones que firmen unos pocos datos de pequeño tamaño ya residentes en
cliente y por tanto no obtengan beneficio en evitar la descarga de los datos del servidor y subida de
las firmas.
Para activar el modo de firma se deberá llamar al siguiente método de configuración antes de la
llamada al método de firma del lote:
AutoScript.setLocalBatchProcess(true)
Al realizarse por completo en local, la firma monofásica de lotes NO requiere:
• Desplegar el servicio de firma trifásica y de lotes.
• Configurar las URL de los servicios en la llamada al método signBatchProcess.
Ha de tenerse en cuenta que esta operación NO es compatible con Autofirma App. Si desea que su
despliegue sea compatible con dispositivos móviles, no utilice este modo. Si se hiciese y se ejecutase
la operación desde un móvil, se ignoraría el uso del método setLocalBatchProcess y se requeriría
despliegue y configuración del servicio de firma trifásica.
Una vez activado este modo, hay que tener en cuenta los siguientes aspectos:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
70
• Los datos indicados en el parámetro datareference de las llamadas para agregar
documentos al lote deberán ser los propios datos que se van a firmar.
• En la llamada al método de firma del lote, los parámetros batchPreSignerUrl y
batchPostSignerUrl deberán ser nulos.
• El JSON de respuesta de la operación incluirá un atributo “signature” por cada operación
completada correctamente. Este atributo contendrá el Base 64 de la firma generada.
• Los códigos de resultado de las operaciones son un subconjunto de los de la operación de
firma de lotes trifásica, a pesar de que conceptualmente puedan no sean exactos. De esta
forma la única diferencia que hay que tener en cuenta en el procesado de la respuesta de
una operación u otra es de dónde se obtiene la firma. Los códigos de resultado devueltos
podrán ser:
o DONE_AND_SAVED
▪ La firma se generó correctamente y se devuelve el resultado en el atributo
“signature”.
o ERROR_PRE
▪ Error durante la firma.
o SKIPPED
▪ No se realizará la firma o se ignoró el resultado por haber encontrado un
error en otra firma.
Advertencia: La generación de firma de lotes monofásica obliga a que el JavaScript de la página
del trámite cargue en memoria los documentos y las firmas generadas. Esto supone un problema
para el navegador, que puede no ser capaz de manejar estos datos debido a limitaciones de
memoria. No se recomienda usar este sistema si se trabaja con múltiples documentos o tamaños
de documentos de más de unos pocos megabytes.
6.5.5.1 Ejemplo de operación de firma monofásica de lote
Aquí se incluye un ejemplo de código JavaScript que ejecuta una operación de firma monofásica de
lote:
// Método callback para procesar el resultado del lote
function exitoCallback(result, certB64) {
// Comprobamos que todas las firmas han terminado correctamente
var allSignaturesOk = true;
for (var i = 0; i < result.signs.length && allSignaturesOk; i++) {
if ("DONE_AND_SAVED" != result.signs[i].result) {
allSignaturesOk = false;
}
}
// Si todas las firmas son correctas, las enviamos a través de un formulario
if (allSignaturesOk) {
for (var i = 0; i < result.signs.length; i++) {
addToForm(result.signs[i].id, result.signs[i].signature);
}

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
71
getForm().submit();
}
// Si alguna de las firmas fallo, mostramos un error
else {
alert("Ocurrió un error al procesar algunas de las firmas");
}
}
// Método callback para tratar los errores
function errorCallback(errorType, errorMessage) {
// Alertamos al usuario del error
alert("Error durante la firma del lote: " + errorMessage);
}
// Método de firma
function firmarLote() {
// Creamos lote con el algoritmo de firma y una configuración de firma
// por defecto
AutoScript.createBatch("SHA512", "CAdES", "sign", "mode=explicit");
// Activamos el modo de firma de lote monofásica
AutoScript. setLocalBatchProcess(true);
// Agregamos al lote los datos
AutoScript.addDocumentToBatch("1", base64Dato1);
AutoScript.addDocumentToBatch("2", base64Dato2, "CAdES", "sign",
"mode=implicit");
AutoScript.addDocumentToBatch("3", base64Dato3);
AutoScript.addDocumentToBatch("4", base64Dato4);
// Enviamos a firmar el lote
AutoScript.signBatchProcess(true, null, null,
"filters=nonexpired:true", exitoCallback, errorCallback);
}
6.5.5.2 Resultado de la firma monofásica del lote
El resultado de la firma monofásica del lote es igual al de su firma trifásica, salvo porque se agrega un
elemento signatura con el resultado de la operación.
Esta estructura JSON es acorde al siguiente esquema:
{
"$schema": "http://json-schema.org/draft-04/schema#",
"type": "object",
"properties": {
"signs": {
"type": "array",
"items": [
{
"type": "object",

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
72
"properties": {
"id": {
"type": "string"
},
"result": {
"type": "string"
},
"signature": {
"type": "string"
},
"description": {
"type": "string"
}
},
"required": [
"id",
"result"
]
}
]
}
},
"required": [
"signs"
]
}
Un ejemplo de JSON de resultado (con parte de las cadenas base 64 omitidas) podría ser el
siguiente:
{
"signs":[
{"id":"7725374e-728d-4a33-9db9-3a4efea4cead",
"result":"DONE_AND_SAVED",
"signature":"MII…JAN4saJN="
}
,
{"id":"93d1531c-cd32-4c8e-8cc8-1f1cfe66f64a",
"result":" ERROR_PRE",
"description":"java.io.IOException: No se pudo guardar el fichero"
}
]
}
6.5.6 Antiguo mecanismo de firma de lotes
Autofirma 1.7 y anteriores no disponían del mecanismo de firma de lotes que se ha descrito. En su
lugar, disponían de un mecanismo que constaba de un único método que recibía un XML con todos
los parámetros de configuración del lote. Este mecanismo de firma de lotes sigue existiendo en
Autofirma 1.8 y superiores, pero se considera obsoleto y no se documenta para alentar a que los
nuevos despliegues utilicen el mecanismo de firma de lotes aquí descrito, más eficiente y sencillo de
usar.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
73
Si su aplicación usaba el antiguo mecanismo y no desea migrar, no tiene que hacer ningún cambio.
Su aplicación seguirá funcionando con Autofirma 1.8 y superiores.
Aquellos despliegues que usasen el antiguo mecanismo de firma de lotes y quieran migrar al nuevo,
tienen la opción de adaptar tanto el despliegue como la lógica en servidor para optimizarla a sus fines.
Para quien desee evitar desarrollar de nuevo la lógica en servidor o reutilizar uno de los mecanismos
que ya existían, se ha incluido en el nuevo servicio de firma trifásica un gestor de documentos que
permitirá seguir utilizando los antiguos mecanismos de carga de datos (Base 64 o a través de URL) y
los SignSavers para el guardado de las firmas (ya fuese alguno de los incluidos por defecto para el
guardado en fichero o envío a un servicio, o uno creado a medida). Consulte el apartado II.2.2 Gestor
de documentos “LegacyBatchDocumentManager” para más información sobre el nuevo gestor de
documentos que permite la compatibilidad con los antiguos SignSavers.
Advertencia: Las aplicaciones móviles de firma Android y iOS son compatibles con el nuevo
mecanismo de firma de lotes, mientras que no lo son con el mecanismo antiguo.
6.6 Selección de certificado
Autofirma App permite a las aplicaciones solicitar un certificado a los usuarios sin necesidad de
realizar una operación de firma. Esta operación puede ser útil para construir filtros de certificados
para operaciones posteriores, realizar validaciones previas sobre el certificado y/o mostrar
información de este en su aplicación web. Sin embargo, esta operación nunca debe usarse para
autenticar a los usuarios, ya que lo que se obtiene es únicamente la parte pública de los certificados
y un mecanismo de autenticación que usase sólo eso podría ser fácilmente sorteado mediante un
ataque simple de inyección de código.
La función JavaScript para permitir seleccionar un certificado de usuario es:
function selectCertificate(params, successCallback, errorCallback);
En esta función:
• params
o Parámetros de configuración de la operación que afecten a la selección de
certificados.
o Se pueden configurar filtros de certificados, como se indica en el apartado 7.3
Configuración de los filtros de certificados, y la selección automática de certificado,
como se describe en el apartado 7.4 Selección automática de certificados.
• successCallback
o Función callback JavaScript que se ejecutará cuando se seleccione un certificado.
Esta función recibirá los siguientes parámetros:
1. El certificado seleccionado codificado en Base64.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
74
• errorCallback
o Función callback JavaScript que se ejecutará cuando ocurra un error al seleccionar
el certificado. Esta función recibirá hasta dos parámetros:
1. En el primer parámetro se recibe un texto con el tipo del error.
2. En el segundo parámetro se recibe un texto con el mensaje de error.
El método de selección de certificado solicitará la contraseña de los almacenes utilizados si es
necesario para poder listar los certificados que contienen, pero nunca utilizará las claves privadas de
los certificados, así que en ningún caso pedirá las contraseñas para ello.
Este método también es compatible con la función setStickySignatory(boolean) (véase el
apartado 6.2.1 Firma de múltiples documentos (firma masiva)) con la cual es posible fijar el certificado
seleccionado por el usuario. De esta forma se utilizará el mismo certificado durante las siguientes
operaciones de firma o selección, siempre y cuando no se utilice la misma instancia de Autofirma.
A continuación, se muestran distintos ejemplos de la operación de selección de certificado:
• Selección de certificado y envío a servidor para su análisis:
…
var mostrarError = function(errorType, errorMessage) {
alert(“Error en la descarga de los datos: ” + errorMessage);
}
var enviarCertificado = function(certB64) {
document.getElementById(“cert”).value = certB64;
document.getElementById(“formulario”).submit();
}
var extraParams = “filters.0=issuer.contains:FNMT\n” +
“filters.1=issuer.contains:Policia”;
AutoScript.selectCertificate (extraParams, enviarCertificado, mostrarError);
…
6.7 Operaciones de gestión de ficheros
Advertencia: Las operaciones de gestión de ficheros no son compatibles con Autofirma App. En
cada uno de los siguientes subapartados se describen casos de uso alternativos para suplir el uso
de los métodos aquí descritos y así mantener la compatibilidad con dispositivos móviles.
Autofirma permite hacer uso de varias operaciones de carga y guardado de ficheros en disco. Estas
operaciones están orientadas a facilitar a las aplicaciones la integración de las operaciones del cliente,

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
75
sobre todo cuando se desea firmar un fichero que el usuario tenga en su posesión o cuando se desee
permitir al usuario, justo después de firmar, guardar copia de la firma que haya generado.
El uso de estas operaciones se puede evitar mediante JavaScript y desarrollos en servidor, lo que por
regla general darían lugar a aplicaciones más estables y una mejor experiencia de usuario. También
es probable que su aplicación sea candidata a obtener beneficiosos del uso de la firma trifásica.
Consulte el apartado ANEXO II Firma trifásica para obtener más información sobre este tipo de
operaciones. En los siguientes apartados se plantean también alternativas para el uso de las distintas
operaciones, lo cual también hará la solución compatible con aplicaciones móviles.
6.7.1 Guardado de datos en disco
La función de guardado permite proporcionar a Autofirma unos datos codificados en Base64 para
que este ofrezca al usuario almacenarlo en disco mediante un diálogo de guardado. Un uso común
de este método es el de permitir guardar las firmas generadas como resultado de las operaciones de
firma, cofirma o contrafirma.
El integrador puede seleccionar los datos que desea almacenar, la propuesta de nombre para el
fichero y otros parámetros para el diálogo de guardado. Sin embargo, será el usuario el único que
podrá decidir donde desea almacenar los datos y qué nombre tendrá finalmente el fichero.
Los datos guardados son los datos indicados en Base64 ya descodificados. Es decir, si deseamos
almacenar el texto “SOY UN TEXTO A FIRMAR”, convertiremos este texto a Base64 con lo que
obtendríamos la cadena “U09ZIFVOIFRFWFRPIEEgRklSTUFS” y se la pasaríamos al método de
guardado. Si abrimos el fichero resultante encontraremos que este contiene la cadena “SOY UN
TEXTO A FIRMAR”. Si lo que deseamos guardar es una firma o un certificado obtenido en una de las
funciones callback de las operaciones de Autofirma, proporcionaremos al método de carga tal como
se recibe en la función.
La función JavaScript para el guardado de datos en disco es:
saveDataToFile (dataB64, title, fileName, extension, description,
successCb, errorCb);
En esta función:
• dataB64
o Datos que deseamos almacenar codificados como cadena Base64.
o Comúnmente, esto será el resultado de una operación de firma o unos datos que se
habrán procesado previamente para codificarlos a este formato.
• title
o Título del diálogo de guardado.
o Algunos sistemas operativos podrían no mostrar el título del diálogo.
• fileName
o Nombre de fichero que aparecerá por defecto en el diálogo de guardado.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
76
• extension
o Extensión de fichero que se propone para el guardado. Los ficheros visibles del
diálogo se filtrarán para sólo visualizar los que tienen esta extensión mientras esté
seleccionada en el diálogo. Un ejemplo de extensión es: pdf
• description
o Descripción del tipo de fichero que se va a almacenar. Esta descripción aparecerá
asociada a la extensión indicada.
• sucessCb
o Nombre de la función callback JavaScript que se ejecutará en caso de que el guardado
de datos finalice correctamente.
o Si se omite este parámetro, o se establece a null, no se ejecutará ninguna función
al terminar la operación.
o Esta función no recibe parámetros.
• errorCb
o Nombre de la función callback JavaScript que se ejecutará en caso de que el guardado
de datos finalice con errores o cuando el usuario cancele el diálogo de guardado.
o Si se omite este parámetro, o se establece a null, no se ejecutará ninguna función
al terminar la operación.
o Esta función recibe los siguientes parámetros:
1. En el primer parámetro se recibe un texto con el tipo del error.
2. En el segundo parámetro se recibe un texto con el mensaje de error.
A continuación, se muestran distintos ejemplos de operaciones de guardado de fichero:
• Guardado de una firma electrónica:
…
function saveDataCb (dataB64, certB64) {
AutoScript.saveDataToFile (dataB64, "Guardar firma electrónica",
"firma.csig", "csig", "Firma binaria");
}
…
AutoScript.cosign (dataB64, "SHA512", "CAdES", null, saveDataCb, errorCb);
…
• Guardado de datos insertados por el usuario:
…
var text = document.getElementById("userText").value;
var dataB64 = AutoScript.getBase64FromText(text);
AutoScript.saveDataToFile (dataB64, "Guardar", "fichero.txt", "txt",
"Texto plano");

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
77
…
<!-- Formulario HTML con el texto que desea guardar -->
<form>
<textarea name="userText" cols="50" rows="5">Texto</textarea>
</form>
…
La función de guardado es una función auxiliar que permite almacenar en disco un dato que ya
tenemos cargado en la página web y que, probablemente, ya esté en servidor o se desee enviar al
mismo (como en el caso de las firmas electrónicas). Este método se mantiene por compatibilidad y,
aunque es sencillo de usar, requiere depender de una aplicación externa y actualmente no es
compatible con Autofirma App para iOS, por lo que se recomienda que se valoren otro tipo de
alternativas. Por ejemplo:
• Si tenemos los datos en servidor, en lugar de cargarlos en la página y luego usar esta función,
se podría habilitar un servicio para descargarlos directamente desde el navegador.
• Si tenemos los datos cargados en la página, como una firma recién generada, podemos
enviarla primeramente al servidor para procesarla y guardarla. A continuación, podríamos
informar al usuario del resultado de la operación y ofrecerle el descargar una copia utilizando
el mismo método que en el punto anterior.
• Si tenemos los datos en la página página y no deseamos enviarla a servidor o no queremos
descargarlos de él, podemos utilizar JavaScript para permitir al usuario descargar estos datos
mediante un objeto Blob y un enlace creado al vuelo.
…
function b64toBlob (b64Data) {
let contentType='';
let sliceSize = 512;
const byteChars = atob(b64Data);
const byteArrays = [];
for (let offset = 0; offset < byteChars.length; offset += sliceSize) {
const slice = byteChars.slice(offset, offset + sliceSize);
const byteNumbers = new Array(slice.length);
for (let i = 0; i < slice.length; i++) {
byteNumbers[i] = slice.charCodeAt(i);
}
const byteArray = new Uint8Array(byteNumbers);
byteArrays.push(byteArray);
}
return new Blob(byteArrays, {type: contentType});
}
…

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
78
// Creamos la URL de descarga y se la asociamos a un enlace
var blob = b64toBlob(signatureB64);
var url = window.URL.createObjectURL(blob);
document.getElementById('download_link').href = url;
…
6.7.2 Selección y recuperación de un fichero por parte del usuario
Autofirma permite que un usuario cargue un fichero de su sistema local y recuperar su nombre y
contenido. Este método nos permite cargar ficheros para firmarlos, multifirmarlos u operar con ellos
de cualquier otro modo.
La función JavaScript para la carga de ficheros en disco es:
getFileNameContentBase64 (title, extensions, description, filePath,
successCb, errorCb);
En esta función:
• title
o Título del diálogo de selección.
• extensions
o Listado de extensiones de fichero permitidas. Estas aparecerán separadas por una
coma (‘,’) y sin espacios entre ellas. Por ejemplo: pdf,jpg,txt. El diálogo sólo
mostrará los ficheros con estas extensiones, salvo que el usuario establezca lo
contrario manualmente en el diálogo.
• description
o Descripción del tipo de fichero que se espera cargar. Esta descripción aparecerá
asociada a las extensiones indicadas.
• filePath
o Ruta absoluta del fichero que se debería seleccionar por defecto o sólo el nombre de
fichero sugerido.
• successCb
o Función callback JavaScript que se invocará cuando se cargue correctamente un
fichero.
o Esta función recibe los siguientes parámetros:
1. En el primer parámetro se recibe el nombre del fichero seleccionado.
2. En el segundo parámetro se recibe el contenido del fichero codificado en
Base64.
• errorCb
o Función callback JavaScript de error que se invocará cuando ocurra un error al cargar
un fichero o cuando el usuario cancele el diálogo de selección.
o Esta función recibe los siguientes parámetros:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
79
1. En el primer parámetro se recibe un texto con el tipo del error.
2. En el segundo parámetro se recibe un texto con el mensaje de error.
A continuación, se muestra un ejemplo de carga de fichero:
• Carga de un fichero y recogida de su nombre:
…
var fileName;
var fileContentB64;
AutoScript.getFileNameContentBase64(
“Seleccionar fichero”, “jpg,gif,png”, “Imagen”, null,
loadDataSuccessCallback, loadDataErrorCallback
..);
…
function loadDataSuccessCallback(name, contentB64) {
filename = name;
fileContentB64 = contentB64;
}
function loadDataErrorCallback(errorType, errorMsg) {
alert(“Error: ” + errorMsg);
}
…
La función de carga de fichero permite cargar un fichero del disco del usuario y obtener su contenido
y nombre en la página web. Sin embargo, este fichero no debería ser tramitado directamente sin
haberse realizado las comprobaciones necesarias para saber que es válido para el objetivo que se
desee, salvo que no tengamos ningún tipo de restricción sobre el tipo de fichero. También hay que
tener en cuenta que, cuando cargamos datos para firmar, lo común suele ser enviar posteriormente
a servidor esos datos junto con la firma generada. Según el caso, el uso del método de carga de
ficheros se podría sustituir por alguna de las siguientes lógicas de negocio:
• Si queremos firmar un fichero y no tenemos ningún tipo de restricción sobre el tipo de datos
que debe cargarse, podría omitirse la carga independiente de los datos y llamar al método de
firma en cuestión sin pasarle datos. En ese caso, será la propia aplicación de firma la que
ofrecerá al usuario cargar un fichero para firmarlo.
o Advertencia: Este caso de uso no es compatible con Autofirma App para iOS.
• Si queremos cargar un fichero para firmarlo, pero antes queremos comprobar que sea un
fichero válido, podríamos permitir que el usuario cargue los datos en la aplicación
primeramente mediante un componente HTML de carga de fichero. Una vez cargado el
documento en servidor podemos realizar las comprobaciones necesarias sobre él y cargar su
contenido en el HTML de la página en Base64 para firmarlo. Después sólo deberíamos enviar
al servidor la firma generada, ya que los datos ya estarían cargados.
o Una versión mejorada de esto sería generar la firma de forma trifásica de tal forma
que la aplicación no tenga que cargar el contenido del fichero en la página, se pueda

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
80
firmar el documento mediante un identificador (haciendo uso de un
DocumentManager a medida) y la firma se genere directamente en servidor, con lo
cual tampoco sería necesario enviarla a posteriori. Consulte el apartado ANEXO II
Firma trifásica para saber más sobre este tipo de firmas.
6.7.3 Selección y recuperación de múltiples ficheros por parte del usuario
Además de la operación de carga de un fichero, Autofirma incorpora una función para la carga de
múltiples ficheros que funciona de forma análoga a la anterior.
La función JavaScript para la carga de múltiples ficheros en disco es:
getMultiFileNameContentBase64 (title, extensions, description,
filePath, successCb, errorCb);
En esta función:
• title
o Título del diálogo de selección.
• extensions
o Listado de extensiones de fichero permitidas. Estas aparecerán separadas por una
coma (‘,’) y sin espacios entre ellas. Por ejemplo: pdf,jpg,txt. El diálogo sólo
mostrará los ficheros con estas extensiones, salvo que el usuario establezca lo
contrario manualmente en el diálogo.
• description
o Descripción del tipo de fichero que se espera cargar. Esta descripción aparecerá
asociada a las extensiones indicadas.
• filePath
o Ruta absoluta de uno de los ficheros que se debería seleccionar por defecto o sólo el
nombre sugerido de uno de los ficheros.
• successCb
o Función callback JavaScript de éxito que se invocará cuando se cargue al menos un
fichero.
o Esta función recibe los siguientes parámetros:
1. En el primer parámetro se recibe un array con los nombres de los ficheros
seleccionados.
2. En el segundo parámetro se recibe un array con el contenido en Base64 de
los ficheros seleccionados.
o El contenido de los parámetros recibidos será tal que el nombre del primer elemento
del array de nombres se corresponderá con el contenido del primer elemento del
array de contenidos, y así para cada uno de los elementos de ambos arrays.
• errorCb
o Función callback JavaScript de error que se invocará cuando no se seleccionen
ficheros o cuando se produzca un error durante su carga.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
81
o Esta función recibe los siguientes parámetros:
1. En el primer parámetro se recibe un texto con el tipo del error.
2. En el segundo parámetro se recibe un texto con el mensaje de error.
A continuación, se muestra un ejemplo de carga de fichero:
• Carga de ficheros y recogida de sus nombres:
…
var fileNames;
var fileContentB64s;
AutoScript.getMultiFileNameContentBase64(
“Seleccionar fichero”, “jpg,gif,png”, “Imagen”, null,
loadDataSuccessCallback, loadDataErrorCallback
);
…
function loadDataSuccessCallback(namesArray, contentB64sArray) {
fileNames = namesArray;
fileContentB64s = contentB64sArray;
}
function loadDataErrorCallback(type, msg) {
/* Mostramos todos los errores menos el de cancelación del diálogo. */
if (!“es.gob.afirma.core.AOCancelledOperationException”.equals(type)) {
/* Método del integrador para mostrar logs */
showLog(msg);
}
}
…
6.8 Métodos de utilidad JavaScript
Las siguientes secciones muestran diversas funciones de utilidad que incorpora AutoScript. Estas
funciones no se comunican con la aplicación nativa de firma y pueden ser implementadas por su
propia aplicación. Se suministran únicamente para facilitar la integración de Autofirma. Entre estas
funciones están:
• Conversión de texto a Base64 y viceversa.
• Descarga de datos.
6.8.1 Conversión de una cadena Base64 a texto
AutoScript proporciona un método para la conversión de una cadena Base64 a un texto plano. Este
método permite mostrar al usuario en texto plano información que se posea Base64. Casos en los
que puede ser necesario esto son cuando se carga el contenido de un fichero de texto plano desde
disco por medio de alguno de los métodos de carga o cuando los datos son el resultado de una firma
XML, por ejemplo. El juego de caracteres que se usará para interpretar el texto siempre será UTF-8.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
82
La función JavaScript para recuperar el texto plano correspondiente a la cadena en Base64 es:
getTextFromBase64(dataB64);
En esta función:
• dataB64
o Son los datos Base64 que se quieren mostrar como texto plano.
Este método devuelve una cadena con el texto plano correspondiente.
A continuación, se muestra un ejemplo de decodificación de un texto Base64:
• Decodificación de una firma XML generada previamente
…
function showTextCallback (xmlSignB64) {
var text = AutoScript.getTextFromBase64(xmlSignB64);
alert(text);
}
…
AutoScript.sign(dataB64, “SHA1”, “XAdES”, “format=XAdES Enveloped”,
showTextCallback, errorCallback);
…
6.8.2 Conversión de un texto a cadena Base64
AutoScript proporciona un método para la conversión de un texto plano a una cadena Base64. Este
método permite pasar al método de firma un texto insertado por el usuario, por ejemplo. Se
interpretará que el texto proporcionado es UTF-8.
La función JavaScript para convertir de texto plano a Base64 es:
getBase64FromText(plaintText);
En esta función:
• plainText
o Es el texto plano que se desea convertir a Base64.
Este método devuelve una cadena Base64 que es la codificación del texto plano indicado.
A continuación, se muestra un ejemplo de decodificación de un texto Base64:
• Firma de un texto insertado por el usuario
…

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
83
var text = "Hola Mundo!!";
var dataB64 = AutoScript.getBase64FromText(text);
AutoScript.sign (dataB64, "SHA512", "CAdES", null, successCallback,
errorCallback);
…
6.8.3 Descarga de datos remotos
AutoScript proporciona un método para la descarga de datos remotos. Este método accede a una
URL establecida por el integrador, descarga el contenido que en ella se encuentra e invoca a un
método callback al que le proporciona los datos descargados en Base64.
La descarga de los datos se realiza desde JavaScript y sufre las limitaciones que aplican los
navegadores a este tipo de descargar. Por norma, sólo podrán descargarse datos accesibles desde
una URL con el mismo dominio y esquema (HTTP o HTTPS) que la web que integra AutoScript.
La descarga de los datos se realiza por medio del método GET de HTTP y se realiza de forma asíncrona.
Es decir, se descargan los datos en un hilo de ejecución distinto al proceso principal. Una vez termina
el proceso de descarga, se invoca a un método callback establecido por el integrador, de tal forma
que se pueda recuperar el resultado de la operación.
La función JavaScript para descarga de datos remotos es:
downloadRemoteData (url, successCallback, errorCallback);
En esta función:
• url
o URL de acceso a los datos a descargar.
• successCallback
o Nombre de la función callback que se invocará cuando se terminen de descargar los
datos.
o Esta función recibirá como único parámetro los datos descargados en Base64.
• errorCallback
o Nombre de la función callback que se invocará cuando se produczca un error al
descargar los datos. Esta función recibirá como parámetros:
1. En el primer parámetro se recibe un texto con el tipo del error.
2. En el segundo parámetro se recibe un texto con el mensaje de error.
Este método devuelve no devuelve nada y su ejecución es asíncrona.
A continuación, se muestra un ejemplo de descarga de datos:
• Descarga de datos y posterior firma

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
84
…
var mostrarError = function(e) {
alert(“Error en la descarga de los datos: ” + e);
}
var iniciarFirma = function(datosB64) {
AutoScript.sign (datosB64,
algorithm,
format,
null,
successCallback,
errorCallback);
}
var url = “https://midominio.com/informe.pdf”;
AutoScript.downloadRemoteData (url, iniciarFirma, mostrarError);
…

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
85
### 7 ### Configuración de las operaciones
7.1 Paso de parámetros adicionales
Los métodos del API JavaScript para el uso de Autofirma trasladan los datos a la aplicación de firma
en forma de cadenas de texto. Algunas de estas cadenas son datos binarios codificados en Base64
(como el parámetro de datos a firmar), mientras que otras son textos planos (como los nombres del
formato y el algoritmo de firma). En muchas de las operaciones del API existe un parámetro concreto,
usualmente denominado params o estraParams, que se utiliza para establecer una serie de
propiedades de configuración opcionales. Estos parámetros se expresan en texto plano en forma de
tuplas de claves y valores, emulando el formato de los objetos de propiedades de Java (Properties).
Los mencionados objetos de propiedades tienen un formato como el que sigue:
nombreParam1=valorParam1
nombreParam2=valorParam2
…
Para expresar cadenas en este formato desde JavaScript, se concatenarán cada una de las líneas
usando el carácter especial de nueva línea (\n) como separador:
var params=’nombreParam1=valorParam1\nnombreParam2=valorParam2’;
Es importante especificar el nombre de las propiedades exactamente como se indique, ya que puede
existir diferenciación entre mayúsculas y minúsculas. Cualquier parámetro no soportado por la
operación invocada, simplemente, se ignorará.
Nota: Autofirma interpreta todos los textos, tanto los recibidos como los devueltos en las
respuestas, usando el juego de caracteres UTF-8. Para poder transmitirlos y mostrarlos
correctamente desde una página web es necesario que esta se encuentre codificada en UTF-8 y lo
declare como tal.
En caso de no ser posible, se recomienda:
• Que el Base64 de los textos a proporcionar a Autofirma se hayan obtenido desde un
entorno en el que se pueda gantizar que originalmente estaban codificados en UTF-8. Por
ejemplo, que el texto ya estuviese previamente codificado o que se codifique a través de
un servicio.
• No mostrar directamente al usuario los mensajes devueltos por el propio Autofirma.
Ejemplo de uso:
…
AutoScript.cargarAppAfirma();

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
86
// Configuramos 3 parámetros adicionales:
// - expPolicy: Política de firma
// - filters: Filtros de certificados vigentes
// - signerClaimedRoles: Roles del firmante
var extraParams =
"expPolicy=FirmaAGE\nfilters=keyusage.nonrepudiation:true\n" +
"signerClaimedRoles=Apoderado";
// Ejecutamos la operación de firma
AutoScript.sign (dataB64, "CAdES", "SHA512", extraParams,
successCallback, errorCallback);
…
7.2 Omisión de diálogos gráficos
Es posible indicarle a Autofirma que evite detener una operación mostrando diálogos gráficos que
requieran la atención del usuario. Esto emita que se muestre el diálogo de selección de certificados
(salvo que sea obligatorio) y cualquier otro diálogo que pueda interrumpir la operación. Esto es útil,
sobre todo cuando, se desean realizar varias operaciones consecutivas que se deben ejecutar sin
interrupciones, como en la firma masiva.
Podemos configurar la omisión de diálogos gráficos mediante la propiedad headless.
headless=true
Por defecto, si no se establece la propiedad headless o se indica un valor distinto de true, se mostrarán
los diálogos gráficos necesarios para completar la operación.
Hay que tener en cuenta que siempre se mostrará el diálogo de selección de certificados si hay más
de un certificado que se pueda usar en el almacén de claves que se utilice. Si queremos asegurarnos
de que sólo haya un certificado elegible y así se omita el certificado, sería necesario establecer un
filtro de certificados que sólo permita la selección del certificado que deseamos. Consulta el apartado
7.3 Configuración de los filtros de certificados para saber como establecer filtros de certificados. Si
quisiéramos omitir el diálogo de selección de certificados, pero no el resto de los diálogos, se puede
configurar la operación tal como se describe en el apartado 7.4 Selección automática de certificados.
Autofirma App ignora la propiedad headless por las restricciones de seguridad de los propios
sistemas.
7.3 Configuración de los filtros de certificados
Autofirma dispone de filtros de certificados que se pueden aplicar para restringir los certificados que
podrá seleccionar el usuario para realizar una operación de firma o multifirma. Los filtros de
certificados se pueden establecer como parámetros adicionales en las distintas operaciones de firma
y selección de certificados.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
87
Por defecto, Autofirma no mostrará al usuario los certificados caducados. Sin embargo, si se
establecen filtros de certificados, se mostrarán todos aquellos certificados disponibles que cumplan
con las condiciones dadas, incluidos los certificados caducados. Para omitir expresamente estos
certificados se puede utilizar el filtro “nonexpired:”, explicado más adelante en este apartado.
Advertencia: El uso de filtros de certificados no esta soportado por Autofirma App. Las propiedades
de configuración de filtros serán ignoradas por las aplicaciones móviles.
Las claves que nos permiten establecer filtros de certificados son:
• filters: Esta clave permite establecer uno o más de los filtros de certificados que se listan más
adelante en este apartado. Los certificados deberán cumplir las condiciones establecidas en
todos los filtros listados, o de lo contrario no se mostrarán. Los distintos filtros se deben
separar mediante el carácter punto y coma (‘;’). Ejemplos:
o filters=nonexpired:false
▪ Motrar todos los certificados, incluso los caducados.
o filters=issuer.rfc2254: (O=DIRECCION GENERAL DE LA
POLICIA);keyusage.nonrepudiation:true
▪ Mostrar sólo certificados de firma del DNIe.
o filters=issuer.rfc2254: (O=DIRECCION GENERAL DE LA
POLICIA);keyusage.nonrepudiation:true;nonexpired:
▪ Mostrar sólo certificados de firma del DNIe no caducados.
• filters.X: En esta clave ‘X’ será un entero igual o mayor que 1. Autofirma leerá la clave filters.1,
a continuación, filters.2 y así hasta que no encuentre una de las claves de la secuencia. Al
contrario que con la clave filters, basta con que el certificado cumpla uno de estos filtros para
que se muestre. No es necesario cumplirlos todos. Cada una de estas claves puede declarar
varios filtros separados por punto y coma (‘;’) de tal forma que sí se deberán cumplir todos
ellos para satisfacer ese sub-filtro concreto. Ejemplos:
o Mostrar los certificados no caducados del ciudadano con NIF 11111111H:
▪ filters.1=subject.rfc2254:(SERIALNUMBER=*11111111H);none
xpired:
▪ filters.2=subject.rfc2254:(CN=*11111111H*);nonexpired:
• IMPORTANTE: Las autoridades certificadoras pueden agregar el DNI
del ciudadano en distintos campos del certificado y Autofirma no

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
88
dispone de un modo de localizarlo. Sin embargo, la mayor de ellas ya
agrega el DNI como parte del RDN “SERIALNUMBER” del subject del
certificado. Algunas también lo agregan como parte del CN. Así, este
ejemplo, englobaría funcionaria con buena parte de los certificados
personales emitidos por autoridades españolas, pero puede que no
con todas.
o Mostrar los certificados CERES y el certificado de firma del DNIe:
▪ filters.1=nonexpired:;issuer.rfc2254:(O=DIRECCION
GENERAL DE LA POLICIA);keyusage.nonrepudiation:true
▪ filters.2=nonexpired:;issuer.rfc2254:(O=FNMT-RCM)
Estas claves de definición de filtros son excluyentes y tienen prioridad según el orden en el que se
han listado (filters y filters.X). Es decir, si se establece la propiedad filters, no se procesarán las
propiedades del tipo filters.1, por ejemplo.
Los filtros disponibles en Autofirma son:
• Filtro de certificados caducados: Filtra los certificados para que no se muestren aquellos que
se encuentren fuera de su periodo de validez, que son los únicos que pueden generar una
firma válida. El filtro determina si un certificado está vigente en base a la fecha/hora del
equipo del usuario.
o Para establecer este filtro se usará el valor “nonexpired:”.
o Ejemplo:
▪ filters=nonexpired:
Un integrador también puede habilitar o deshabilitar expresamente este filtro siguiéndolo de
las palabras “true” o “false”, respectivamente.
Por defecto, si no se indica ningún filtro de certificados, Autofirma omitirá los certificados
que estén fuera de su periodo de validez. Si se desea que se muestren los certificados
caducados sin indicar ningún otro filtro, se puede configurar la propiedad de filtrado de la
siguiente manera:
o filters=nonexpired:false
• Filtro por número de serie de certificados cualificados de firma: Filtra los certificados del
almacén para que sólo se muestre aquellos con un número de serie concreto, lo que
comúnmente hará que se muestre un único certificado. En el caso de que el certificado
identificado por el filtro no sea un certificado cualificado para firma, se buscará en el almacén
un certificado parejo que sí lo esté. Si se encontrase se seleccionaría este nuevo certificado
y, si no, se seleccionará el certificado al que corresponde el número de serie.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
89
o Para establecer este filtro se usará el valor “qualified:” seguido por el número de serie
del certificado en hexadecimal.
o Ejemplos:
▪ filters=qualified:45553a61
▪ filters=qualified:03ea
• Filtro en base a certificado codificado: Filtra los certificados para seleccionar uno concreto
proporcionado a través del filtro. Esto es de utilidad cuando, después de una operación
realizada con un certificado, se quiere restringir futuras operaciones para que se realicen con
el mismo certificado.
o Para establecer este filtro se usará el valor “encodedcert:” seguido del certificado
codificado en Base64. Esto es, tal como se devuelve a través del callback en los
métodos de firma y selección de certificado.
o Ejemplo:
▪ filters=encodedcert:MIIIcjCCBlqgAwIB……………radvEjJ=
▪ Este filtro mostrará sólo aquel certificado que hemos proporcionado
en el filtro, en caso de que exista en el almacén.
• Filtro por huella digital (Thumbprint): Filtra los certificados de tal forma que sólo se mostrará
aquel que tenga la huella digital indicada. Hay que tener en cuenta que esta huella digital no
debe calcularse en base a un fichero (por ejemplo, un “.cer”), sino que es la huella digital de
la codificación del certificado.
o Para establecer este filtro se usará el valor “thumbprint:” seguido del algoritmo de
huella digital utilizado y, separado por el carácter dos puntos (‘:’) la huella digital que
se busque en hexadecimal.
o Ejemplo:
▪ filters=thumbprint:SHA1:30 3a bb 15 44 3a fd d7 c5 a2 52
dc a5 54 f4 c5 ee 8a a5 4d
▪ Este filtro sólo mostrará el certificado cuya huella digital en SHA1 sea
la indicada.
• Filtro DNIe: Filtra los certificados del almacén para que sólo se muestren los certificados de
firma de los DNIe disponibles desde ese almacén.
o Para establecer este filtro se usará el valor “dnie:”.
o Ejemplo:
▪ filters=dnie:
• Filtro de certificados SSCD: Filtra los certificados del almacén para que se muestren sólo
aquellos generados en un dispositivo SSCD (dispositivo seguro de creación de firma), como
es el caso de los certificados del DNIe. Hay que tener en cuenta que el filtrado se realiza a
partir de un atributo QCStatement declarado en el propio certificado. Si la autoridad de
certificación no incluye este atributo, no será posible realizar la distinción.
o Para establecer este filtro se usará el valor “sscd:”.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
90
o Ejemplo:
▪ filters=sscd:
• Filtro de certificados de firma: Filtra los certificados del almacén para que se muestren todos
los certificados salvo el certificado de autenticación del DNIe. Este filtro se crea para evitar
excluir algunos tipos de certificados con los KeyUsage mal declarados.
o Para establecer este filtro se usará el valor “signingCert:”.
o Ejemplo:
▪ filters=signingCert:
Para un filtrado más correcto de los certificados de firma, utilice el filtro
“keyusage.nonrepudiation:”.
• Filtro de certificados de autenticación: Filtra los certificados del almacén para que se
muestren todos los certificados salvo el certificado de firma del DNIe. Este filtro se crea para
evitar excluir algunos tipos de certificados con los KeyUsage mal declarados.
o Para establecer este filtro se usará el valor “authCert:”.
o Ejemplo:
▪ filters=authCert:
Para un filtrado más correcto de los certificados de autenticación, utilice el filtro
“keyusage.digitalsignature:”.
• Filtro RFC2254 en base al Subject del certificado: Filtra los certificados a partir de una
expresión regular creada según la RFC2254 que se aplica sobre el Subject del certificado.
o Para establecer este filtro se usará el valor “subject.rfc2254:“ seguido de la expresión
RFC2254.
o Puede revisarse la normativa RFC 2254 en http://www.faqs.org/rfcs/rfc2254.html
o Ejemplo:
▪ filters=subject.rfc2254:(CN=*12345678z*)
▪ Este filtro mostrará sólo aquellos certificados en los que aparezca la
cadena “12345678z” en el CommonName de su Subject.
• Filtro RFC2254 en base al Issuer del certificado: Filtra los certificados a partir de una expresión
regular creada según la RFC2254 que se aplica sobre el Issuer del certificado.
o Para establecer este filtro se usará el valor “issuer.rfc2254:” seguido de la expresión
RFC2254.
o Puede revisarse la normativa RFC 2254 en http://www.faqs.org/rfcs/rfc2254.html
o Ejemplo:
▪ filters=issuer.rfc2254:(|(O=FNMT-RCM)(O=DIRECCION
GENERAL DE LA POLICIA))
▪ Este filtro mostrará sólo aquellos certificados cuyo Issuer tenga
establecido como organización “FNMT” o “DIRECCION GENERAL DE
LA POLICIA”, es decir, sólo mostrará los certificados del DNIe y los de
la FNMT.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
91
o Este filtro puede aplicarse de forma recursiva, de tal forma que permitirá el uso del
certificado si cualquier de los certificados de la cadena de certificación por encima de
él mismo cumple con la expresión indicada. Para utilizar recursivamente este filtro se
usará el valor issuer.rfc2254.recurse: seguido de la expresión RFC2254.
o Ejemplo:
▪ filters=issuer.rfc2254.recurse:(CN=*FNMT*)
▪ Este filtro mostrará sólo aquellos certificados en los que alguno de
los certificados de su cadena de certificación tenga la partícula
“FNMT” en el nombre común
• Filtro de texto en base al Subject del certificado: Filtra los certificados según si contienen o
no una cadena de texto en el Principal de su Subject.
o Para establecer este filtro se usará el valor “subject.contains:” seguido de la cadena
de texto que debe contener.
o Ejemplo:
▪ filters=subject.contains:JUAN ESPAÑOL ESPAÑOL
▪ Este filtro mostrará sólo aquellos certificados en los que aparezca la
cadena “JUAN ESPAÑOL ESPAÑOL” en el Subject.
• Filtro de texto en base al Issuer del certificado: Filtra los certificados según si contienen o no
una cadena de texto en el Principal de su Issuer.
o Para establecer este filtro se usará el valor “issuer.contains:” seguido de la cadena de
texto que debe contener.
o Ejemplo:
▪ filters=issuer.contains:O=EMPRESA
▪ Este filtro mostrará sólo aquellos certificados en los que el Principal
del Issuer muestre el texto “O=EMPRESA”.
• Filtros por uso declarado de los certificados (KeyUsage): Colección de filtros que permiten
filtrar según el uso declarado de los certificados.
o Para establecer estos filtros usaremos las siguientes claves según los usos que se
quieran comprobar. Las claves irán seguidas de los valores “true” o “false”, según se
desee que el uso esté habilitado o no lo esté, respectivamente:
▪ keyusage.digitalsignature:
▪ keyusage.nonrepudiation:
▪ keyusage.keyencipherment:
▪ keyusage.dataencipherment:
▪ keyusage.keyagreement:
▪ keyusage.keycertsign:
▪ keyusage.crlsign:
▪ keyusage.encipheronly:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
92
▪ keyusage.decipheronly:
o Los KeyUsages que no se declaren en el filtro no se tendrán en cuenta.
o Ejemplos:
▪ filters=keyusage.digitalsignature:true;keyusage.
keyencipherment:true
▪ Este filtro mostrará sólo aquellos certificados que tengan
establecidos a true los KeyUsage digitalsignature
(autenticación) y keyencipherment (sobres electrónicos), ignorando
el valor del resto de KeyUsages.
▪ filters=keyusage.nonrepudiation:false
▪ Este filtro mostrará sólo aquellos certificados que no declaren el
KeyUsage de firma avanzada.
• Filtro por identificador de directiva: Filtra los certificados por aquellos que poseen un
identificador de directiva concreto. Esto es útil para mostrar sólo determinado tipo de
certificados de una autoridad de certificación.
o Para establecer este filtro se usará el valor “policyid:” seguido por el listado de OIDs,
separados por comas (‘,’), por los que se quieran filtrar.
o Ejemplo:
▪ filters=policyid:1.3.6.1.4.1.18332.3.4.1.2.11
▪ Este filtro mostrará sólo aquellos certificados con el identificador de
directiva “1.3.6.1.4.1.18332.3.4.1.2.11”.
• Filtro de seudónimo: Permite filtrar los certificados permitiendo que el usuario se centre en
los certificados de pseudónimo, lo que permite que su nombre real del usuario quede
excluido de la firma.
o Para establecer este filtro se usará uno de los siguientes valores:
▪ pseudonym:only
▪ Establece que sólo se muestren los certificados de pseudónimo.
▪ pseudonym:andothers
▪ Establece que se muestren los certificados de pseudónimo y aquellos
que no tienen un certificado de seudónimo asociado. Así, quedan
ocultos los certificados que tienen un certificado equivalente de
seudónimo.
▪ Es es el valor por defecto y se utilizará incluso si se escribe
“pseudonym:” a secas o seguido de cualquier valor que no coincida
con otro de los valores permitidos.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
93
o Ejemplo:
▪ filters=pseudonym:
• Filtro de almacenes externos: Permite deshabilitar el botón de carga de almacenes PKCS#12
en el diálogo de selección de certificados. De esta forma sólo podrán usarse los certificados
del almacén seleccionado por el integrador o los por defecto del navegador en caso de que
el integrador ni especificase ningún almacén.
o Para establecer este filtro se usará el valor “disableopeningexternalstores“.
o Ejemplo:
▪ filters=disableopeningexternalstores
Se ignorará cualquier valor establecido como filtro de certificados distinto a los que se han listado.
Si ningún certificado cumple los criterios de filtrado, se ejecutará la operación de error indicando que
no se ha encontrado ningún certificado que cumpla con los criterios indicados.
Si más de un certificado cumple los criterios de filtrado, se mostrarán todos ellos en el diálogo de
selección de certificados.
Si tan sólo un certificado cumple con las condiciones de los filtros establecidos y se ha configurado la
opción “mandatoryCertSelection” o “headless” en las propiedades adicionales de la operación, se
seleccionará automáticamente ese certificado sin mostrar el diálogo de selección al usuario. Consulte
el apartado 7.4 Selección automática de certificados para conocer cómo configurar la propiedad
“mandatoryCertSelection”.
7.4 Selección automática de certificados
Para aquellos casos en los que sólo exista un certificado en el almacén de certificados o cuando se
descarten certificados mediante filtros y sólo haya uno que es posible seleccionar, es posible indicar
a Autofirma que lo seleccione automáticamente en lugar de mostrar al usuario el diálogo de selección
con este único certificado. Esto podemos configurarlo mediante la propiedad
mandatoryCertSelection.
mandatoryCertSelection=false
Por defecto, si no se establece la propiedad mandatoryCertSelection o se indica un valor distinto de
true, se mostrará el diálogo de selección de certificados aun cuando sólo haya un certificado para
seleccionar.
Autofirma App ignora la propiedad mandatoryCertSelection por las restricciones de seguridad de los
propios sistemas.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
94
7.5 Configuración de la política de firma
La política de firma de una firma electrónica identifica diversos criterios que se han cumplido durante
la construcción de esta firma o requisitos que cumple la propia firma. Los formatos de firma CAdES,
PAdES y XAdES permiten declarar la política de firma que se ha seguido para su generación.
Tenga en cuenta que el que una firma incluya los atributos correspondientes a una política de firma
concreta no significa que cumpla los criterios de la política. Si desea que sus firmas se ajusten a una
política de firma lea las restricciones impuestas por esa política y genere firmas acordes a ella antes
de configurarla. De esta forma, podrá asegurarse de que sus firmas son compatibles con otros
sistemas y entornos en los que se utilicen firmas acordes a la política en cuestión.
7.5.1 Política de firma de la AGE v1.9
En Autofirma se ha incluido un mecanismo para la configuración rápida y sencilla de la política de
firma de la Administración General del Estado (AGE) v1.9. Para configurar esta política concreta basta
con indicar la siguiente propiedad propiedad adicional en la operación de firma deseada.
expPolicy=FirmaAGE
Esta propiedad se expandirá a las necesarias para el cumplimiento de la política de firma de la AGE,
lo que equivale a introducir las propiedades manualmente.
Los parámetros de esta política para cada uno de los formatos comprendidos en la misma los
siguientes:
• CAdES
o policyIdentifier=2.16.724.1.3.1.1.2.1.9
o policyIdentifierHash=G7roucf600+f03r/o0bAOQ6WAs0=
o policyIdentifierHashAlgorithm=http://www.w3.org/2000/09/xmldsig#sha1
o policyQualifier=https://sede.administracion.gob.es/politica_de_firma_
anexo_1.pdf
o mode=implicit
• XAdES
o policyIdentifier=urn:oid:2.16.724.1.3.1.1.2.1.9
o policyIdentifierHash=G7roucf600+f03r/o0bAOQ6WAs0=
o policyIdentifierHashAlgorithm=http://www.w3.org/2000/09/xmldsig#sha1
o policyQualifier=https://sede.administracion.gob.es/politica_de_firma_
anexo_1.pdf
o format=XAdES Detached
• PAdES
o policyIdentifier=2.16.724.1.3.1.1.2.1.9
o policyIdentifierHash=G7roucf600+f03r/o0bAOQ6WAs0=
o policyIdentifierHashAlgorithm=http://www.w3.org/2000/09/xmldsig#sha1
o policyQualifier=https://sede.administracion.gob.es/politica_de_firma_
anexo_1.pdf
La propiedad format, sólo se aplicará cuando el formato de firma sea XAdES.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
95
La propiedad mode, sólo se aplicará cuando el formato de firma sea CAdES y los datos ocupen menos
de 1 MB. Los datos no se incluirán en la firma cuando su tamaño sea mayor, siguiendo, de forma
general, la especificación establecida por la política de firma de la AGE:
En el caso de que, debido al tamaño de los datos a firmar, no resulte técnicamente posible o
aconsejable realizar las firmas con el formato anteriormente descrito (que la firma contenga
los datos firmados), se generará la estructura de firma detached, que incluye el hash del
documento original en la firma.
Debido a la generalidad de la especificación, se permite al integrador definir qué tamaños de datos
pueden incluirse dentro de la firma y cuáles no para su aplicación, por lo que, en caso de haberse
indicado expresamente un modo de firma (parámetro mode), se utilizará el valor establecido por el
integrador.
Si se configura para la operación alguna propiedad individual que entre en conflicto con la política
indicada (por ejemplo, indicando un formato prohibido por esta), se ignorará esa propiedad individual
y prevalecerá el valor impuesto por la política. Por ejemplo, si se configurasen las propiedades
expPolicy=FirmaAGE y format=XAdES Enveloping, para una operación de firma con formato XAdES,
se generaría una firma XAdES Detached con la política de firma de la AGE establecida. Es decir, se
ignoraría que se estableció la propiedad format=XAdES Enveloping.
Para más información sobre la política de firma de la AGE puede consultar la guía de
implementación de la política:
https://administracionelectronica.gob.es/ctt/politicafirma#.YBEdyzr0mbg.
Para saber cómo configurar propiedades en las operaciones de firma, consulte el apartado 7.1 Paso
de parámetros adicionales.
7.5.2 Política de firma de Factura electrónica (Facturae)
Para la firma de facturas electrónicas se deberá utilizar siempre el formato de firma FacturaE.
Configurar este formato establecerá automáticamente las propiedades necesarias para la firma de
facturas electrónicas, incluida la política de firma.
Las firmas generadas con este formato siempre son según la especificación 3.1 de factura electrónica.
7.6 Validación de firmas previas
Las operaciones de cofirma y contrafirma se realizan sobre firmas generadas anteriormente. Salvo en
casos concretos, Autofirma permite agregar nuevas firmas a cualquier firma compatible sin
restricción. Esto implica que, por ejemplo, se podría contrafirmar una firma que no sea válida por
haberse caducado su certificado.
Es posible que desde su aplicación quiera restringirse, en la medida de lo posible, el que se cofirmen
y contrafirmen firmas inválidas, para lo cual puede usarse la opción checkSignatures.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
96
checkSignatures=true
Esta propiedad realiza una verificación criptográfica de la firma y comprueba la caducidad de los
certificados utilizados en ella. Esto no es una validación completa de firma, ya que para considerar
que la firma es válida deben realizarse otras operaciones no soportadas por Autofirma, como la
comprobación del estado de revocación de los certificados o la adhesión de la firma a la política de
firma que declare.
Esta propiedad debe usarse para reducir la posibilidad de procesar firmas inválidas, pero es
responsabilidad de la aplicación saber si son válidas antes de enviarse a procesar o, si es el usuario el
que selecciona expresamente estas firmas, el realizar una validación posterior.
Si durante el proceso de cofirma o contrafirma se detecta que la firma de entrada no es válida, el
nuevo proceso de firma fallará y se notificará el error a través del método callback configurado.
Si se pude completar este proceso de validación, la multifirma continuará normalmente.
La verificación de las firmas previas es una operación compatible con los siguientes formatos de firma:
• CAdES
• XAdES
• PAdES
La verficación se realiza tanto en la generación de firmas monofásicas en Autofirma como trifásicas
con cualquiera de las aplicaciones de firma. En el caso de las firmas monofásicas, la validación se
realiza al inicio del proceso de firma, mientras que en las firmas trifásicas el proceso se realiza en
servidor. Por este motivo, al realizar firmas trifásicas se le pedirá el certificado al usuario incluso si la
firma no es válida, ya que esto es algo que no se identificará hasta más adelante en el proceso de
firma.
Si su despliegue es compatible con aplicaciones móviles y desea que estas también validen la firma
previa antes de agregar otra nueva, asegúrese de que en estos entornos móviles se configura el
nombre de formato de firma que obliga a la generación de la firma de forma trifásica (CAdEStri,
XAdEStri o PAdEStri).

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
97
### 8 ### Formatos de firma
Autofirma permite la generación de firmas en diversos formatos con diversos perfiles básicos. Las
firmas en estos formatos pueden ser mejoradas a posteriori con otros productos para incluir la
información longeva de firma.
Los formatos avanzados soportados son:
• CAdES
o Formato avanzado de firma binaria.
• XAdES
o Formato avanzado de firma XML.
• PAdES
o Formato avanzado de firma de documentos PDF.
• FacturaE
o Formato para la firma de facturas electrónicas. Se trata de una firma XAdES
especialmente adaptada para cumplir los requisitos de firma de las facturas
electrónicas.
Autofirma soporta por retrocompatibilidad otros formatos de firma, pero ninguno de estos formatos
se recoge en la política de firma de la AGE, su uso está desaconsejado y no se proporciona soporte
sobre los mismos:
• CMS
o Formato de firma binaria no avanzado.
o Se recomienda sustituir por el formato CAdES, con el que es compatible.
• XMLdSig
o Formato de firma XML no avanzado.
o Se recomienda sustituir por el formato XAdES, con el que es compatible.
• ODF
o Formato de firma basado en XMLdSig y utilizado por OpenOffice/LibreOffice.
o Se recomienda sustituirlo por firmas PAdES sobre documentos PDF para seguir
gestionándolas junto al documento firmado o por firmas CAdES o XAdES si su sistema
puede gestionar por separado el documento y la firma electronica.
• OOXML
o Formato de firma basado en XAdES y utilizado por Microsoft Office.
o Se recomienda sustituirlo por firmas PAdES sobre documentos PDF para seguir
gestionándolas junto al documento firmado o por firmas CAdES o XAdES si su sistema
puede gestionar por separado el documento y la firma electronica.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
98
Adicionalmente, se soporta el nombre de formato “NONE” para permitir realizar una firma sin
formato (PKCS#1). La utilidad de esto es permitir generar el formato de firma externa y utilizar
Autofirma únicamente para generar el cifrado con el certificado del usuario.
En los siguientes apartados, se proporciona información adicional de los principales formatos de firma
soportados, junto con el listado de opciones de Autofirma para configurarlos.
8.1 Configuración de firmas CAdES
Las firmas CAdES generadas por Autofirma son, por defecto, acordes a todas las siguientes versiones
del formato de firma:
• v1.7.3 (ETSI TS 101 733 v1.7.3)
• v1.7.4 (ETSI TS 101 733 v1.7.4)
• v1.8.1 (ETSI TS 101 733 v1.8.1)
• v1.8.3 (ETSI TS 101 733 v1.8.3)
• v2.1.1 (ETSI TS 101 733 v2.1.1)
• v2.2.1 (ETSI TS 101 733 v2.2.1)
Las firmas CAdES no declaran cuál es su versión de formato de firma, por lo que puede considerarse
que una misma firma se ajusta a todas las versiones anteriormente listadas.
El Cliente @firma permite generar firmas CAdES acordes a los siguientes perfiles de firma:
• CAdES-BES
o Todas las firmas CAdES generadas por Autofirma sin política de firma son
consideradas CAdES-BES.
• CAdES-EPES
o Todas las firmas CAdES generadas por Autofirma con política de firma son
consideradas CAdES-EPES.
Hay que tener en cuenta que algunas de las firmas CAdES generadas por Autofirma también pueden
considerarse de tipo B-Level. Sin embargo, Autofirma no incluye un modo de operación que permita
asegurar que las firmas generadas sean acordes a este perfil.
Algunas de las propiedades de configuración listadas en el apartado 8.1.3 Parámetros adicionales
pueden afectar a la compatibilidad de las firmas generadas con algunas versiones o perfiles del
formato. Consulte el apartado específico de cada propiedad para saber si esta afecta o no a la
compatibilidad.
Las firmas CAdES que Autofirma genera por defecto no incluyen ni los datos firmados (firma explícita)
ni política de firma y se ajusta al perfil CAdES-BES.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
99
8.1.1 Algoritmos de firma
Para configurar el algoritmo de firma indicaremos el algoritmo de huella digital que se debe usar.
Autofirma soporta los siguientes algoritmos de huella para la generación de firmas CAdES:
• SHA512
• SHA384
• SHA256
• SHA1 (No recomendado)
El algoritmo de firma concreto que se utilizará aplicará el algoritmo de huella indicado y el cifrado
correspondiente para el tipo de certificado seleccionado por el usuario (RSA o ECC). Por ejemplo, si
se configurase el algoritmo SHA256 y el usuario seleccionase un certificado con claves de curva
elíptica (ECC), se generaría la firma usando el algoritmo SHA256withECDSA.
No es recomendable el algoritmo SHA1 por ser obsoleto y vulnerable.
El algoritmo más seguro y, por lo tanto, el recomendado para su uso es SHA512.
Si los certificados del usuario se encuentran en tarjeta inteligente, asegúrese de disponer de la última
versión de su controlador para garantizar la compatibilidad con estos algoritmos de firma. En caso de
que, aún así, no pueda utilizar este algoritmo con su tarjeta inteligente, consulte la información de
compatibilidad de su tarjeta y/o pruebe con otro algoritmo.
8.1.2 Firmas CAdES implícitas o explícitas
Las firmas CAdES pueden incluir internamente una copia de los datos firmados (firmas implícitas o
“attached”) o no incluirlos (firmas explícitas o “detached”). Autofirma por defecto genera firmas
explícitas, más pequeñas en tamaño, pero es posible que desee generar firmas implícitas para
disponer en un sólo fichero de los datos y la firma electrónica, así como tener toda la información
necesaria para la validación completa de la firma. Para generar firmas implícitas, debe indicar el
siguiente parámetro adicional:
mode=implicit
8.1.3 Parámetros adicionales
A continuación, se detallan los parámetros adicionales que aceptan cada una de las operaciones de
firma.
Es posible que el uso de parámetros no contemplados en las siguientes tablas provoque otros
cambios de funcionamiento de Autofirma o en la información contenida en las firmas CAdES. No
obstante, no se dará soporte al aplicativo si se usan parámetros no documentados, asumiendo el
integrador todo el riesgo y responsabilidad derivados del uso de parámetros o valores distintos de
los aquí descritos.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
100
8.1.3.1 Firma y cofirma
Nombre del parámetro Valores
posibles
Descripción
mode explicit La firma resultante no incluirá los datos
firmados. Si no se indica el parámetro mode se
configura automáticamente este
comportamiento.
implicit La firma resultante incluirá internamente una
copia de los datos firmados.
El uso de este valor podría generar firmas de
gran tamaño. En las cofirmas, este parámetro se
ignorará si los datos ya estaban contenidos en
la firma original o si no se proporcionan los
datos.
contentTypeOid OID Identificador del tipo de dato firmado.
contentDescription [Texto] Descripción textual del tipo de datos firmado.
includeMimeTypeAttribute true Incluye en la firma el atributo id-aa-ets-
mimeType definido en CAdES v2.1.1 y
superiores (válido en firmas baseline). El valor
de mimetype se tomará de la propiedad
mimetype o, si no se incluyo, se extrapolará de
la propiedad contentTypeOid. Si tampoco
fuese posible, se tratarán de obtener estos
valores de alguna de las firmas previas (en caso
de cofirmas). Si tampoco fuese posible, se
obtendrá el tipo del análisis de los datos (que
podría no ser correcto o concreto). En caso de
que no se pueda obtener el tipo de ninguna
manera, se usará el mimetype
application/octet-stream.
false No incluye el atributo id-aa-ets-
mimeType en la firma. Valor por defecto.
mimeType [Texto en
formato
MIME-Type]
MIME-Type de los datos a firmar. Sólo se incluye
cuando se indica la propiedad
includeMimeTypeAttribute.
policyIdentifier [OID o URN
de tipo OID]
Identificador de la política de firma, necesario
para generar firmas CAdES-EPES.
policyIdentifierHash [Valor en
Base64]
Huella digital de la política de firma. Es
obligatorio indicar este parámetro si de indicó
también policyIdentifier, al igual que es
obligatorio también dar valor al parámetro
policyIdentifierHashAlgorithm.
policyIdentifierHashAlgorithm SHA1 Indica que la huella digital indicada en la
propiedad policyIdentifierHash se
calculó mediante el algoritmo SHA1.
SHA-256 Indica que la huella digital indicada en la
propiedad policyIdentifierHash se
calculó mediante el algoritmo SHA-256.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
101
SHA-384 Indica que la huella digital indicada en la
propiedad policyIdentifierHash se
calculó mediante el algoritmo SHA-284.
SHA-512 Indica que la huella digital indicada en la
propiedad policyIdentifierHash se
calculó mediante el algoritmo SHA-512.
policyQualifier [URL hacia
documento]
URL (universalmente accesible) hacia el
documento (normalmente PDF) que contiene
una descripción textual de la política de firma.
Esta propiedad es opcional incluso si se desea
generar firmas CAdES-EPES.
includeOnlySignningCertificate true Indica que debe incluirse en la firma
únicamente el certificado del firmante.
false Indica que debe incluirse en la firma toda la
cadena de certificación del certificado firmante.
Valor por defecto.
signatureProductionCity [Texto] Agrega a la firma un campo con la ciudad en la
que se realiza la firma. La codificación debe ser
UTF-8.
signatureProductionPostalCode [Texto] Agrega a la firma un campo con el código postal
en donde se realiza la firma. La codificación
debe ser UTF-8.
signatureProductionCountry [Texto] Agrega a la firma un campo con el país en la que
se realiza la firma. La codificación debe ser UTF-
8.
signerClaimedRoles [Texto] Agrega a la firma campos con los cargos
atribuidos al firmante. Deben separarse los
cargos con el carácter “|” (y este no puede estar
en el propio texto de ningún cargo).
commitmentTypeIndications [Entero] Indica el número de
CommitmentTypeIndications que se van a
declarar. Estos son los motivos que se declaran
para la firma. Los valores concretos se
especifican con
commitmentTypeIndicationnIdentif
ier y
commitmentTypeIndicationnDescrip
tion, donde ‘n’ va desde 0 hasta el valor
indicado en esta propiedad menos 1.
commitmentTypeIndication### nIdentifier 
1 Establece que el CommitmentTypeIndications
número ### n (contando desde cero) es “Prueba
de origen”.
2 Establece que el CommitmentTypeIndications
número ### n (contando desde cero) es “Prueba
de recepción”.
3 Establece que el CommitmentTypeIndications
número ### n (contando desde cero) es “Prueba
de entrega”.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
102
4 Establece que el CommitmentTypeIndications
número ### n (contando desde cero) es “Prueba
de envío”.
5 Establece que el CommitmentTypeIndications
número ### n (contando desde cero) es “Prueba
de aprobación”.
6 Establece que el CommitmentTypeIndications
número ### n (contando desde cero) es “Prueba
de creación”.
commitmentTypeIndication### nCommitment
TypeQualifiers
[Texto] Lista de indicadores textuales separados por el
carácter '|' que se aportan como calificadores
adicionales del CommitmentTypeIndication
número n (atributo opcional). Normalmente
son OID.
Los elementos de la lista no pueden contener el
carácter '|' (ya que este se usa como
separador).
signingCertificateV2 true Se incluirá el atributo SigningCertificateV2 en la
firma.
false (U
otro valor)
Se incluirá el atributo SigningCertificate en la
firma
Sin
especificar
Se incluirá SigningCertificate si la firma utiliza un
algoritmo de firma SHA1 y SigningCertificateV2
para el resto de los algoritmos.
includeSigningTimeAttribute true Se incluye en la firma la marca de tiempo con la
hora del equipo. Valor por defecto.
false No se incluye la marca de tiempo en la firma.
Esta opción sólo se debería usar para generar
una firma apta para componer una firma PAdES.
includeContentHintAttribute true Se incluye el atributo content-hints en la firma
con la información de los datos firmados. Este
valor se ignorará cuando se configure
expresamente un tipo de firma que no permite
este atributo. Valor por defecto.
false No se incluye el atributo content-hints en la
firma. Esta opción sólo se debería usar para
generar una firma apta para componer una
firma PAdES.
allowSignLTSignature true Se permite la cofirma/contrafirma de firmas de
archivo longevo, a pesar de que estas no serán
válidas posteriormente.
false (U
otro valor)
No se permite la cofirma/contrafirma de firmas
de archivo longevo.
Sin
especificar
Se consultará al usuario en caso de intentar
confirmarse/contrafirmarse una firma de
archivo longevo.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
103
8.1.3.2 Contrafirma
Nombre del parámetro Valores
posibles
Descripción
policyIdentifier [OID o URN
de tipo OID]
Identificador de la política de firma, necesario
para generar firmas CAdES-EPES.
policyIdentifierHash [Valor en
Base64]
Huella digital de la política de firma. Es
obligatorio indicar esta propiedad si de indicó
también policyIdentifier, al igual que es
obligatorio también dar valor al parámetro
policyIdentifierHashAlgorithm.
policyIdentifierHashAlgorithm SHA1 Indica que la huella digital indicada en el
parámetro policyIdentifierHash se
calculó mediante el algoritmo SHA1.
SHA-256 Indica que la huella digital indicada en el
parámetro policyIdentifierHash se
calculó mediante el algoritmo SHA-256.
SHA-384 Indica que la huella digital indicada en el
parámetro policyIdentifierHash se
calculó mediante el algoritmo SHA-284.
SHA-512 Indica que la huella digital indicada en el
parámetro policyIdentifierHash se
calculó mediante el algoritmo SHA-512.
policyQualifier [URL hacia
documento]
URL (universalmente accesible) hacia el
documento (normalmente PDF) que contiene
una descripción textual de la política de firma.
Esta propiedad es opcional incluso si se desea
generar firmas CAdES-EPES.
includeOnlySignningCertificate true Indica que debe incluirse en la firma
únicamente el certificado del firmante.
false Indica que debe incluirse en la firma toda la
cadena de certificación del certificado firmante.
Valor por defecto.
signerClaimedRoles [Texto] Agrega a la firma campos con los cargos
atribuidos al firmante. Deben separarse los
cargos con el carácter “|” (y este no puede estar
en el propio texto de ningún cargo).
signatureProductionCity [Texto] Agrega a la firma un campo con la ciudad en la
que se realiza la firma. La codificación debe ser
UTF-8.
signatureProductionPostalCode [Texto] Agrega a la firma un campo con el código postal
en donde se realiza la firma. La codificación
debe ser UTF-8.
signatureProductionCountry [Texto] Agrega a la firma un campo con el país en la que
se realiza la firma. La codificación debe ser UTF-
8.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
104
commitmentTypeIndications [Entero] Indica el número de
CommitmentTypeIndications que se van a
declarar. Estos son los motivos que se declaran
para la firma. Los valores concretos se
especifican con
commitmentTypeIndicationnIdentif
ier y
commitmentTypeIndicationnDescrip
tion, donde ‘n’ va desde 0 hasta el valor
menos 1 indicado en esta propiedad.
commitmentTypeIndication### nIdentifier 
1 Establece que el CommitmentTypeIndication
número ### n es “Prueba de origen”.
2 Establece que el CommitmentTypeIndication
número ### n es “Prueba de recepción”.
3 Establece que el CommitmentTypeIndication
número ### n es “Prueba de entrega”.
4 Establece que el CommitmentTypeIndication
número ### n es “Prueba de envío”.
5 Establece que el CommitmentTypeIndication
número ### n es “Prueba de aprobación”.
6 Establece que el CommitmentTypeIndication
número ### n es “Prueba de creación”.
commitmentTypeIndication### nCommitmentT
ypeQualifiers
[OID] Lista de OID separados por el caracter '|' que se
aportan como calificadores adicionales del
CommitmentTypeIndication número n (atributo
opcional).
allowSignLTSignature true Se permite la cofirma/contrafirma de firmas de
archivo longevo, a pesar de que estas no serán
válidas posteriormente.
false (U
otro valor)
No se permite la cofirma/contrafirma de firmas
de archivo longevo.
Sin
especificar
Se consultará al usuario en caso de intentar
confirmarse/contrafirmarse una firma de
archivo longevo.
8.2 Configuración de firmas XAdES
Las firmas XAdES generadas por defecto con Autofirma son acordes a la versión 1.3.2 del formato de
firma (ETSI TS 101 903 v1.3.2).
Es posible configurar las operaciones de firma para que se generen conforme a la versión 1.4.1 del
formato (ETSI TS 101 903 v1.4.1). Para ello, será necesario configurar los parámetros adicionales
xadesNamespace y signedPropertiesTypeUrl.
Autofirma permite generar firmas acordes a los siguientes perfiles:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
105
• XAdES-BES
o Todas las firmas XAdES generadas por Autofirma sin política de firma son
consideradas XAdES-BES.
• XAdES-EPES
o Todas las firmas XAdES generadas por Autofirma con política de firma son
consideradas XAdES-EPES.
Hay que tener en cuenta que algunas de las firmas XAdES generadas por Autofirma también pueden
considerarse de tipo B-Level. Sin embargo, Autofirma versión 1.7 no incluye un modo de operación
que permita asegurar que las firmas generadas sean acordes a este perfil.
Con independencia del perfil de firma, es posible realizar las firmas XAdES en cuatro modos
diferentes:
• Enveloping (Por defecto)
• Enveloped
• Internally Detached (también referida en este documento como Detached)
• Externally Detached
Algunas de las propiedades de configuración listadas en el apartado 8.2.7 Parámetros adicionales
pueden afectar a la compatibilidad de las firmas generadas con algunas versiones del formato o
perfiles de firma. Consulte el apartado específico de cada propiedad para saber si esta afecta o no a
la compatibilidad.
8.2.1 Algoritmos de firma
Para configurar el algoritmo de firma indicaremos el algoritmo de huella digital que se debe usar.
Autofirma soporta los siguientes algoritmos de huella para la generación de firmas XAdES:
• SHA512
• SHA384
• SHA256
• SHA1 (No recomendado)
El algoritmo de firma concreto que se utilizará aplicará el algoritmo de huella indicado y el cifrado
correspondiente para el tipo de certificado seleccionado por el usuario (RSA o ECC). Por ejemplo, si
se configurase el algoritmo SHA256 y el usuario seleccionase un certificado con claves de curva
elíptica (ECC), se generaría la firma usando el algoritmo SHA256withECDSA.
No es recomendable usar el algoritmo SHA1 por estar obsoleto y ser vulnerable.
El algoritmo más seguro y, por lo tanto, el recomendado para su uso es SHA512.
Si los certificados del usuario se encuentran en tarjeta inteligente, asegúrese de disponer de la última
versión de su controlador para garantizar la compatibilidad con estos algoritmos de firma. En caso de

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
106
que, aún así, no pueda utilizar este algoritmo con su tarjeta inteligente, consulte la información de
compatibilidad de su tarjeta y/o pruebe con otro algoritmo.
8.2.2 Algoritmos de huella digital para las referencias
XAdES hace cálculos de huella digital (hash) para cada una de las referencias firmadas. El algoritmo
por defecto para estas huellas es SHA-512. Este puede cambiarse mediante el parámetro adicional
referencesDigestMethod.
En el caso de las referencias de las firmas con manifest, el algoritmo de huella se toma del parámetro
adicional precalculatedHashAlgorithm. En caso de que esta propiedad no se indique, se
utilizaría el algoritmo del parámetro referencesDigestMethod o, de no estar configurado, el
algoritmo SHA-512.
Consulte el apartado 8.2.7 Parámetros adicionales para conocer los valores que pueden adoptar estos
parámetros.
8.2.3 Situación del nodo de firma en XAdES Enveloped
Autofirma sitúa por defecto la firma electrónica en las firmas XAdES Enveloped en un nodo
“Signature” directamente como hijo de la raíz del XML. No obstante, hay situaciones en las que puede
interesar situar este nodo de firma en otra posición del XML.
Para ello, puede usarse el parámetro adicional insertEnvelopedSignatureOnNodeByXPath, en el
que, mediante una expresión XPath v1, podemos indicar el nodo en el que queremos se inserte la
firma (el nodo “Signature” pasará a ser el primer hijo de este). Si la expresión XPath resolviese varios
nodos, se usará el primero de ellos.
Por ejemplo, en el siguiente XML:
<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
<book category="COOKING">
<title lang="en">Everyday Italian</title>
<author>Giada De Laurentiis</author>
<year>2005</year>
<price>30.00</price>
</book>
<book category="CHILDREN">
<title lang="en">Harry Potter</title>
<author>J K. Rowling</author>
<year>2005</year>
<price>29.99</price>
</book>
</bookstore>
Si indicamos el parámetro con este valor:
insertEnvelopedSignatureOnNodeByXPath = /bookstore/book[1]/title

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
107
La firma se insertará como nodo hijo del título del primer libro:
<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
<book category="COOKING">
<title lang="en">
Everyday Italian
<ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="S1">
…
</ds:Signature>
</title>
<author>Giada De Laurentiis</author>
<year>2005</year>
<price>30.00</price>
</book>
<book category="CHILDREN">
<title lang="en">Harry Potter</title>
<author>J K. Rowling</author>
<year>2005</year>
<price>29.99</price>
</book>
</bookstore>
Si en la expresión XPath desea referenciar nodos dentro de un espacio de nombres, debe usar
funciones XPath como namespace-uri() o local-name(). Por ejemplo, para seleccionar el
primer nodo dentro del espacio de nombres de factura electrónica podríamos usar la expresión:
//*[namespace-uri()='http://www.facturae.es/Facturae/2007/v3.1/Facturae']
8.2.4 Transformaciones sobre el contenido a firmar
Es posible declarar transformaciones adicionales sobre el contenido a firmar. Esto se realizará
mediante las siguientes propiedades:
• xmlTransformnType
o Tipo de transformación.
• xmlTransformnSubtype
o Subtipo de transformación.
• xmlTransformnBody:
o Transformación específica.
Las combinaciones de valores que pueden adoptar estas propiedades son:
• Transformación XPATH
o Tipo: http://www.w3.org/TR/1999/REC-xpath-19991116
o Subtipos: No tiene subtipos.
o Cuerpo: Especificado mediante sentencias de tipo XPATH.
• Transformación XPATH2
o Tipo: http://www.w3.org/2002/06/xmldsig-filter2

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
108
o Subtipos:
▪ subtract: Resta.
▪ intersect: Intersección
▪ union: Unión
o Cuerpo: Especificado mediante sentencias de tipo XPATH2.
• Transformación BASE64. La transformación es inversa, es decir, los datos se decodifican
desde Base64 antes de firmarse, por lo que estos deben estar previamente codificados en
Base64 e indicarse mediante el parámetro adicional “encodign=base64“.
o Tipo: http://www.w3.org/2000/09/xmldsig#base64
o Subtipos: No tiene subtipos.
o Cuerpo: No tiene cuerpo.
No es posible especificar transformaciones complejas que incluyan varias sentencias. En su lugar,
puede declararse una sucesión de transformaciones simples que produzcan el mismo resultado. Cada
una de las transformaciones se aplicará de forma ordenada sobre el resultado de la anterior.
El listado de transformaciones se inicia con aquella declarada con el índice 0. Por ejemplo, si se desean
insertar 2 transformaciones adicionales, se deberán establecer los parámetros:
xmlTransforms=2
xmlTransform0Type=…
xmlTransform0Subtype=… (Opcional)
xmlTransform0Body=…
xmlTransform1Type=…
xmlTransform1Subtype=… (Opcional)
xmlTransform1Body=…
8.2.5 Uso de estructuras Manifest en firmas XAdES
Es posible crear firmas XAdES en las que, siguiendo el punto 2.3 de la especificación XMLDSig
(http://www.w3.org/TR/2000/WD-xmldsig-core-20000510/#sec-o-Manifest), las referencias XML no
se firmen directamente, sino que se firme una estructura de tipo Manifest que a su vez contenga las
referencias a firmar.
De esta forma, tal y como indica la normativa, la resolución de las referencias incluidas dentro de una
estructura Manifest no es responsabilidad del sistema validador, sino de la aplicación que generó la
firma o una delegada por la misma. Al unir esto con el uso de referencias a datos externos a la firma,
obtenemos la ventaja de que la firma no contendrá los datos firmados (muy recomendable para
trabajar con datos grandes) y que la plataforma validadora no tiene que acceder a los datos para
comprobar la validez de la propia firma. Consulte la especificación XMLDSig para más información.
De igual manera que el sistema validador no tiene que acceder a los datos referenciados desde el
manifest, no será de Autofirma acceder a estos datos para su análisis y el cálculo de su huella digital.
La propia aplicación que ordena la firma será la encargada de proporcionar a Autofirma las
referencias a los datos y la huella digital de los mismos.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
109
Las referencias a los datos firmados en un Manifest se expresan mediante direcciones URI. Estas URI
no tiene necesariamente que ser una URL, así puede estructurarse de la manera necesaria para
ayudar a determinar inequívocamente cuales son los datos que se firman. Por ejemplo, podríamos
construir una URI en forma de URN, en la que referenciásemos a un recurso concreto dentro de uno
de nuestros gestores de contenido, para lo que podríamos crear una URN a medida que tuviese los
datos necesarios para identificar el repositorio de datos y el recurso en cuestión:
urn:rp:mirp:asset:CDC8D258
Un sistema de validación externo no resolverá la URI que referencia a los datos desde un Manifest,
ya que puede que esta sólo sea accesible y/o comprensible desde el entorno en el que se generó la
firma. Por ende, la propia aplicación que firma los datos mediante Manifest o una aplicación delegada
por la misma debe poder asegurar que los datos referenciados mediante la URI no cambiaran y ser
capaz de comprobarlos calculando su huella digital (hash).
Para aprovechar todas las ventajas de las firmas Manifest, todas las firmas Manifest generadas por
el Autofirma serán externally detached, independientemente de la configuración establecida.
Un ejemplo muy simplificado de la estructura de una firma con Manifest sería:
<ds:Signature Id="Signature-02553">
<ds:SignedInfo>
<ds:Reference Id="Reference-894bfd39"
Type=http://www.w3.org/2000/09/xmldsig#Manifest
URI="#Manifest-36e2de7b">
…
</ds:Reference>
</ds:SignedInfo>
…
<ds:Object Id="ManifestObject-ffd54e53">
<ds:Manifest Id="Manifest-36e2de7b">
<ds:Reference Id="Reference-894bfd39"
URI="myscheme://path/file">
<ds:DigestMethod
Algorithm="http://www.w3.org/2001/04/xmlenc#sha512"/>
<ds:DigestValue>…</ds:DigestValue>
</ds:Reference>
</ds:Manifest>
</ds:Object>
…
</ds:Signature>
En este ejemplo, el contenido firmado es “myscheme://path/file”, pero al firmar no se ha
intentado acceder a ese fichero, y se ha asignado la huella digital proporcionada como la
correspondiente a los datos.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
110
8.2.5.1 Generar firma manifest con Autofirma
Para crear firmas XAdES con estructuras manifest desde Autofirma debe especificarse el parámetro
adicional useManifest con el valor “true”.
Adicionalmente, se deberá indicar la URI y la huella digital (hash) de los datos firmados. Autofirma
permite firmar más de un dato simultáneamente mediante manifest así que será posible indicar más
de una URI y huella digital al configurar una firma manifest. Como resultado, se obtendrá una única
firma que engloba todas las referencias. Para que esta firma tuviese validez completa, todos los datos
referenciarlos deberían mantenerse sin cambios a lo largo del tiempo.
Para generar firmas manifest deberán indicarse a través de los parámetros adicionales de la
aplicación las propiedades que se listan a continuación por cada referencia a firmar. Para ello, se
sustituirá la ‘X’ del nombre del parámetro por el número de referencia en cuestión (empezando en
1):
• uriX
o Obligatorio. URI que referencia a los datos.
• mdX
o Obligatorio. Huella digital (hash) en Base64 de los datos. El algoritmo de huella digital
se indicará mediante el parámetro “precalculatedHashAlgorithm”.
• mimeTypeX
o Opcional. MimeType correspondiente a los datos referenciados. Si no se indica, se
usará “application/octet-stream”.
• contentTypeOidX
o Opcional. OID correspondiente al tipo de dato referenciado. Si no se indica, se
intentará extrapolar a partir del MimeType. En caso de no conseguirlo, no se usará
ninguno.
• encodingX
o Opcional. URI identificadora de la codificación de los datos si estuviesen codificados.
Por defecto, no se usa ninguna.
• precalculatedHashAlgorithm
o Algoritmo de huella digital que se ha utilizado para calcular la huella de los datos.
Esta propiedad aplica a todas las referencias insertadas. Si no se indica, se hereda la
configuración del parámetro “referencesDigestMethod”. Si este otro parámetro
tampoco se indicase se interpretará que las huellas digitales se han calculado con el
algoritmo SHA-512.
Al realizar firmas manifest no será necesario indicar datos en el parámetro de datos del método de
firma de Autofirma. El propio Autofirma detectará que se va a realizar una firma manifest y no
solicitará estos datos al usuario.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
111
Por ejemplo, podríamos hacer una firma manifest de unos datos usando los siguientes parámetros
adicionales (extraParams):
useManifest=true
uri1=urn:id:3086
md1=4hrn/3Y9c/fn/uyq12w+D9A2aKc=
mimeType1=plain/xml
precalculatedHashAlgorithm=SHA-1
En la llamada al método de firma, además de estos extraParams, indicaríamos null como el
parámetro de datos a firmar:
AutoScript.sign (null, "SHA512", "XAdES", extraParams, successCallback,
errorCallback);
Como resultado, obtendremos una firma XAdES Detached con un manifest, en el que aparecerá la
referencia indicada a los datos y su huella digital.
8.2.6 Tratamiento de las hojas de estilo XSL de los XML a firmar
Cuando se firma o cofirma (no aplica a la contrafirma) un XML que contiene hojas de estilo, estas se
firman igualmente a menos que se indique lo contrario con el parámetro ignoreStyleSheets. Las
reglas que se siguen para procesar las hojas de estilo son las siguientes:
Referencia /
Formato
XAdES
Enveloped
XAdES
Enveloping
XAdES Internally
Detached
XAdES Externally
Detached
Ruta relativa a la
hoja de estilo
No se firma No se firma No se firma No se firma
Ruta absoluta a
la hoja de estilo
Se incluye la
declaración a la
hoja de estilo y
se firma una
referencia
canonizada a la
hoja de estilo.
Se firma una
referencia
canonizada a la
hoja de estilo.
Se firma una
referencia
canonizada a la
hoja de estilo.
No se firma
Hoja de estilo
empotrada
Se incluye la
declaración a la
hoja de estilo
No es necesaria
ninguna acción
No es necesaria
ninguna acción
No se firma
8.2.7 Parámetros adicionales
A continuación, se detallan los parámetros adicionales que aceptan cada una de las operaciones de
firma.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
112
Es posible que el uso de parámetros no contemplados en las siguientes tablas provoque otros
cambios de funcionamiento. No obstante, no se dará soporte al aplicativo si se usan parámetros no
documentados, asumiendo el integrador todo el riesgo y responsabilidad derivados del uso de
parámetros o valores distintos de los aquí descritos.
8.2.7.1 Firma y cofirma
Nombre del parámetro Valores posibles Descripción
insertEnvelopedSignatureOn
NodeByXPath
[Texto (expresión
XPath v1)]
Indica, mediante una expresión XPath (v1), el nodo
bajo el cual debe insertarse el nodo de firma en el
caso de una firma Enveloped.
Si la expresión devuelve más de un nodo, se usa solo
el primero. Si la expresión no devuelve nodos o está
mal construida se lanzará una excepción.
Esta propiedad solo tiene efecto en firmas
Enveloped.
useManifest true Usa un Manifest de XMLDSig con las referencias de
firma en vez de firmar directamente estas
referencias. Se ignora en la operación de cofirma.
Esto permite que sea opcional la comprobación del
destino y huellas digitales de las referencias.
false Genera las firmas normalmente, sin Manifest
(comportamiento por defecto)
uri [URI] URI que referencia a los datos que se desean firmar
en una firma Externally Detached. La huella de los
datos se proporcionará en el propio parámetro de
datos y el algoritmo de huella a través de
“precalculatedHashAlgorithm”.
uri### n 
[URI] URI que referencia a los datos que se desean firmar
dentro de una firma manifest. ‘### n’ indica el número
de referencia de entre las que se quieren firmar,
empezando en ‘1’.
md### n 
[Texto Base64] Huella digital de los datos asociados a la referencia
‘### n’ en una firma manifest.
mimeType### n 
[Texto en formato
MIME-Type]
MIME-Type de los datos asociados a la referencia
‘### n’ en una firma manifest. Si no se indica esta
propiedad, se utilizará el tipo ‘application/octet-
stream’.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
113
contentTypeOid### n 
[OID o URN de tipo
OID]
Identificador del tipo de dato firmado para la
referencia número ‘### n’ en una firma manifest. Esta
propiedad es complementaria (que no excluyente)
al parámetro mimeTypeX.
encoding### n 
[URI] Codificación de los datos asociados a la referencia
número ‘### n’ en una firma manifest. Un uso
incorrecto de esta propiedad puede provocar la
generación de una firma inválida.
precalculatedHashAlgorithm SHA1 Indica que las huellas digitales de los datos
referenciados en el manifest se calcularon
mediante el algoritmo SHA1.
SHA-256 Indica que las huellas digitales de los datos
referenciados en el manifest se calcularon
mediante el algoritmo SHA-256.
SHA-384 Indica que las huellas digitales de los datos
referenciados en el manifest se calcularon
mediante el algoritmo SHA-384.
SHA-512 Indica que las huellas digitales de los datos
referenciados en el manifest se calcularon
mediante el algoritmo SHA-512.
addKeyInfoKeyValue true Incluye el nodo KeyValue dentro de KeyInfo de
XAdES (comportamiento por defecto en las firmas
con certificado RSA).
false No incluye el nodo KeyValue dentro de KeyInfo de
XAdES. Este es el comportamiento que siempre se
aplica cuando se utiliza un certificado de curva
elíptica para firmar.
addKeyInfoKeyName true Incluye el nodo KeyName dentro de KeyInfo de
XAdES.
false No incluye el nodo KeyName dentro de KeyInfo de
XAdES (comportamiento por defecto).
avoidXpathExtraTransformsO
nEnveloped
true Evita la inclusión de la transformación XPATH2 que
normalmente se añade para posibilitar las cofirmas.
ADVERTENCIA: La cofirma de un documento en el
que al menos una de las firmas no incluye la
transformación XPATH, dará lugar a un documento
de firma que potencialmente será validado
incorrectamente por los validadores de firma. Por
este motivo, sólo se permite el uso de esta
propiedad en la operación de firma (no en la de

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
114
cofirma). Se recomienda usar este valor cuando se
firme un XML grande y no se vayan a confirmar.
false Incluye la transformación XPATH2, lo que posibilita
las cofirmas (comportamiento por defecto).
format XAdES
Enveloping
Genera firmas en formato Enveloping. Este es el
formato que se utiliza por defecto cuando no se
indica ninguno.
XAdES Enveloped Genera firmas en formato Enveloped.
XAdES Detached Genera firmas en formato Internally Detached.
XAdES
Externally
Detached
Genera firmas en formato Externally Detached.
includeOnlySignningCertifi
cate
true Indica que debe incluirse en la firma únicamente el
certificado del firmante.
false Indica que debe incluirse en la firma toda la cadena
de certificación del certificado firmante. Valor por
defecto.
policyIdentifier [URL] Identificador de la política de firma (normalmente
una URL hacia la política en formato XML
procesable), necesario para generar firmas XAdES-
EPES.
policyIdentifierHash [Valor en Base64] Huella digital de la política de firma. Es obligatorio
indicar esta propiedad si el valor indicado en
policyIdentifier no es universalmente
accesible. Si se da valor a esta propiedad es
obligatorio también dar valor al parámetro
policyIdentifierHashAlgorithm.
policyIdentifierHashAlgori
thm
SHA1 Indica que la huella digital indicada en el parámetro
policyIdentifierHash se calculó mediante
el algoritmo SHA1.
SHA-256 Indica que la huella digital indicada en el parámetro
policyIdentifierHash se calculó mediante
el algoritmo SHA-256.
SHA-384 Indica que la huella digital indicada en el parámetro
policyIdentifierHash se calculó mediante
el algoritmo SHA-384.
SHA-512 Indica que la huella digital indicada en el parámetro
policyIdentifierHash se calculó mediante
el algoritmo SHA-512.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
115
policyQualifier [URL hacia
documento]
URL (universalmente accesible) hacia el documento
(normalmente PDF) que contiene una descripción
textual de la política de firma.
Esta propiedad es opcional incluso si se desea
generar firmas XAdES-EPES.
policyDescription [Texto] Descripción textual de la política de firma. En el caso
de que se firme un XML, la codificación del texto
usado debe adecuarse al XML firmado.
Esta propiedad es opcional incluso si se desea
generar firmas XAdES-EPES.
signerClaimedRoles [Texto] Agrega a la firma campos con los cargos atribuidos
al firmante. Deben separarse los cargos con el
carácter “|” (y este no puede estar en el propio
texto de ningún cargo).
En el caso de que se firme un XML, la codificación
del texto usado debe adecuarse al XML firmado.
signatureProductionCity [Texto] Agrega a la firma un campo con la ciudad en la que
se realiza la firma.
En el caso de que se firme un XML, la codificación
del texto usado debe adecuarse al XML firmado.
signatureProductionProvinc
e
[Texto] Agrega a la firma un campo con la provincia en la
que se realiza la firma.
En el caso de que se firme un XML, la codificación
del texto usado debe adecuarse al XML firmado.
signatureProductionPostalC
ode
[Texto] Agrega a la firma un campo con el código postal en
donde se realiza la firma.
En el caso de que se firme un XML, la codificación
del texto usado debe adecuarse al XML firmado.
signatureProductionCountry [Texto] Agrega a la firma un campo con el país en el que se
realiza la firma.
En el caso de que se firme un XML, la codificación
del texto usado debe adecuarse al XML firmado.
referencesDigestMethod http://www.w3.o
rg/2000/09/xmld
sig#sha1
Usa el algoritmo SHA1 para el cálculo de las huellas
digitales de las referencias XML firmadas.
http://www.w3.o
rg/2001/04/xmle
nc#sha256
Usa el algoritmo SHA-256 para el cálculo de las
huellas digitales de las referencias XML firmadas.
http://www.w3.o
rg/2001/04/xmle
nc#sha512
Usa el algoritmo SHA-512 para el cálculo de las
huellas digitales de las referencias XML firmadas.
Este es el comportamiento por defecto.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
116
mimeType [Texto en formato
MIME-Type]
MIME-Type de los datos a firmar. Si no se indica esta
propiedad, el sistema intenta auto-detectar el tipo,
estableciendo el más aproximado (que puede no
ser el estrictamente correcto).
encoding [URI] Codificación de los datos a firmar (vease la
documentación del elemento Object de XMLDSig
para más información). Un uso incorrecto de esta
propiedad puede provocar la generación de una
firma inválida.
Si se proporcionan datos a firmar previamente
codificados en Base 64 pero se desea sean
considerados como su forma descodificada, debe
establecerse este valor a
http://www.w3.org/2000/09/xmldsig#
base64 y especificarse el tipo real en el parámetro
mimeType.
Por ejemplo, para firmar una imagen PNG haciendo
que la firma se refiera a su forma binaria directa,
puede proporcionarse la imagen directamente
codificada en Base64 indicando el encoding
como
http://www.w3.org/2000/09/xmldsig#
base64 y el mimeType como image/png.
El valor debe ser siempre una URI.
outputXmlEncoding [Texto] Codificación del XML de salida.
Si no se indica este valor se intenta auto-detectar a
partir del XML de entrada (si los datos a firmar son
un XML).
contentTypeOid [OID o URN de tipo
OID]
Identificador del tipo de dato firmado. Esta
propiedad es complementaria (que no excluyente)
al parámetro mimeType.
canonicalizationAlgorithm http://www.w3.o
rg/TR/2001/REC-
xml-c14n-
20010315
Se firma el XML con canonizado XML 1.0 inclusivo
(valor por defecto).
http://www.w3.o
rg/TR/2001/REC-
xml-c14n-
20010315#WithCo
mments
Se firma el XML con canonizado XML 1.0 inclusivo
con comentarios.
http://www.w3.o
rg/2001/10/xml-
exc-c14n#
Se firma el XML con canonizado XML 1.0 exclusivo.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
117
http://www.w3.o
rg/2001/10/xml-
exc-
c14n#WithCommen
ts
Se firma el XML con canonizado XML 1.0 exclusivo
con comentarios.
none Omite la canonicalizacion de los datos XML (sólo
operación de firma).
xadesNamespace http://uri.etsi
.org/01903/v1.3
.2#
Establece el espacio de nombres correspondiente a
la versión 1.3.2 de XAdES. Este es el valor por
defecto.
http://uri.etsi
.org/01903/v1.2
.2#
Establece el espacio de nombres correspondiente a
la versión 1.2.2 de XAdES. Si se establece esta
propiedad es posible que se necesite establecer
también el parámetro
signedPropertiesTypeUrl para evitar
incoherencias en la versión de XAdES. El uso de
estas propiedades no garantiza que la firma
generada sea acorde a esta versión de XAdES.
signedPropertiesTypeUrl http://uri.etsi
.org/01903#Sign
edProperties
Establece la URL de definición del tipo de las
propiedades firmadas (Signed Properties) de
XAdES. Este es el valor por defecto.
http://uri.etsi
.org/01903/1.3.
2#SignedPropert
ies
Establece la URL de definición del tipo de las
propiedades firmadas (Signed Properties) de XAdES
v1.3.2.
http://uri.etsi
.org/01903/1.2.
2#SignedPropert
ies
Establece la URL de definición del tipo de las
propiedades firmadas (Signed Properties) de XAdES
v1.2.2. Si se establece esta propiedad es posible
que se necesite establecer también el parámetro
xadesNamespace para evitar incoherencias en
la versión de XAdES. El uso de estas propiedades
no garantiza que la firma generada sea acorde a
esta versión de XAdES.
ignoreStyleSheets true Si se firma un XML con hojas de estilo, ignora éstas
dejándolas sin firmar.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
118
false Si se firma un XML con hojas de estilo, firma
también las hojas de estilo (valor por defecto,
consultar notas adicionales sobre firma de hojas de
estilo).
avoidBase64Transforms true No declara transformaciones Base64 incluso si son
necesarias.
false Declara las transformaciones Base64 cuando se han
codificado internamente los datos a firmar en
Base64 (valor por defecto).
xmlTransforms [Número] Número de transformaciones a aplicar al contenido
firmado. Debe indicarse posteriormente igual
número de parámetros xmlTransformnType,
sustituyendo n por un ordinal consecutivo,
comenzando en 0 (ver notas adicionales sobre
indicación de transformaciones adicionales).
xmlTransform### nType 
http://www.w3.o
rg/2000/09/xmld
sig#base64
Indica que los datos que se proporcionan para
firmar ya están codificados en Base64 y se debe
declarar esta transformación adicional para que se
decodifiquen antes de firmarlos. Esta
transformación Base64 es adicional a la
transformación necesaria para pasar los datos a
través de los métodos de firma de Autofirma.
http://www.w3.o
rg/TR/1999/REC-
xpath-19991116
El contenido se debe procesar mediante esta
transformación XPATH antes de ser firmado.
Únicamente es aplicable cuando se firma contenido
XML.
http://www.w3.o
rg/2002/06/xmld
sig-filter2
El contenido se debe procesar mediante esta
transformación XPATH2 antes de ser firmado.
Únicamente es aplicable cuando se firma contenido
XML.
xmlTransform### nSubtype 
[Texto] 
Subtipo de la transformación ### n. Los valores
aceptados y sus funcionalidades dependen del valor
indicado en xmlTransformnType.
xmlTransform### nBody 
[Texto] 
Cuerpo de la transformación ### n. Los valores
aceptados y sus funcionalidades dependen de los
valores indicados en xmlTransform### nType y en
xmlTransform### nSubtype.
nodeToSign [Texto] Identificador del nodo (establecido mediante el
atributo “Id”) que se desea firmar dentro de un
XML.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
119
commitmentTypeIndications [Entero] Indica el número de CommitmentTypeIndications
que se van a declarar. Estos son los motivos que se
declaran para la firma. Los valores concretos se
especifican con
commitmentTypeIndication### nIdentifie
r y
commitmentTypeIndication### nDescripti
on, donde ‘n’ va desde 0 hasta el valor menos 1
indicado en esta propiedad.
commitmentTypeIndication### nI
dentifier
1 Establece que el CommitmentTypeIndications
número ### n es “Prueba de origen”.
2 Establece que el CommitmentTypeIndications
número ### n es “Prueba de recepción”.
3 Establece que el CommitmentTypeIndications
número ### n es “Prueba de entrega”.
4 Establece que el CommitmentTypeIndications
número ### n es “Prueba de envío”.
5 Establece que el CommitmentTypeIndications
número ### n es “Prueba de aprobación”.
6 Establece que el CommitmentTypeIndications
número ### n es “Prueba de creación”.
commitmentTypeIndication### nD
escription
[Texto] Establece la descripción del
CommitmentTypeIndications número ### n.. Este
atributo es opcional.
commitmentTypeIndication### nD
ocumentationReferences
[Texto] Lista de URL separadas por el carácter '|' que se
aportan como referencias documentales del
CommitmentTypeIndication número ### n (atributo
opcional).
Las URL de la lista no pueden contener el carácter
'|' (ya que este se usa como separador).
commitmentTypeIndication### nC
ommitmentTypeQualifiers
[Texto] Lista de indicadores textuales separados por el
carácter '|' que se aportan como calificadores
adicionales del CommitmentTypeIndication
número n (atributo opcional). Normalmente son
OID.
Los elementos de la lista no pueden contener el
carácter '|' (ya que este se usa como separador).

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
120
allowSignLTSignature true Se permite la cofirma/contrafirma de firmas de
archivo longevo, a pesar de que estas pueden no ser
válidas posteriormente.
false (o cualquier
otro valor)
No se permite la cofirma/contrafirma de firmas de
archivo longevo.
Sin indicar Se consultará al usuario en caso de intentar
cofirmarse/contrafirmarse una firma de archivo
longevo.
avoidAGEPolicyIncompatibil
ities
true Se evitará declarar la política de firma de la AGE
cuando el resultado de la operación vaya a ser
incompatible con esta política.
false (o cualquier
otro valor)
No se permite la cofirma con la política de firma de
la AGE cuando el resultado no será compatible con
la política.
Sin indicar Se consultará al usuario en caso de intentar
cofirmarse una firma incompatible con la policía de
firma de la AGE (como una firma XAdES Enveloping).

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
121
8.2.7.2 Contrafirma
Nombre del parámetro Valores
posibles
Descripción
addKeyInfoKeyValue true Incluye el nodo KeyValue dentro de KeyInfo de XAdES
(comportamiento por defecto).
false No incluye el nodo KeyValue dentro de KeyInfo de XAdES.
addKeyInfoKeyName true Incluye el nodo KeyName dentro de KeyInfo de XAdES.
false No incluye el nodo KeyName dentro de KeyInfo de XAdES
(comportamiento por defecto).
policyIdentifier 
[URL] Identificador de la política de firma (normalmente una
URL hacia la política en formato XML procesable),
necesario para generar firmas XAdES-EPES.
policyIdentifierHash [Texto
Base64]
Huella digital de la política de firma. Es obligatorio indicar
esta propiedad si el valor indicado en
policyIdentifier no es universalmente accesible.
Si se da valor a esta propiedad es obligatorio también dar
valor al parámetro
policyIdentifierHashAlgorithm.
policyIdentifierHashAlgorithm SHA1 Indica que la huella digital indicada en el parámetro
policyIdentifierHash se calculó mediante el
algoritmo SHA1.
SHA-256 Indica que la huella digital indicada en el parámetro
policyIdentifierHash se calculó mediante el
algoritmo SHA-256.
SHA-384 Indica que la huella digital indicada en el parámetro
policyIdentifierHash se calculó mediante el
algoritmo SHA-384.
SHA-512 Indica que la huella digital indicada en el parámetro
policyIdentifierHash se calculó mediante el
algoritmo SHA-512.
policyQualifier 
[URL hacia
document
o]
URL (universalmente accesible) hacia el documento
(normalmente PDF) que contiene una descripción textual
de la política de firma.
Esta propiedad es opcional incluso si se desea generar
firmas XAdES-EPES.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
122
policyDescription 
[Texto] Descripción textual de la política de firma. En el caso de
que se firme un XML, la codificación del texto usado debe
adecuarse al XML firmado.
Esta propiedad es opcional incluso si se desea generar
firmas XAdES-EPES.
signerClaimedRoles 
[Texto] Agrega a la firma campos con los cargos atribuidos al
firmante. Deben separarse los cargos con el carácter “|”
(y este no puede estar en el propio texto de ningún
cargo).
En el caso de que se firme un XML, la codificación del
texto usado debe adecuarse al XML firmado.
signatureProductionCity 
[Texto] Agrega a la firma un campo con la ciudad en la que se
realiza la firma.
En el caso de que se firme un XML, la codificación del
texto usado debe adecuarse al XML firmado.
signatureProductionProvince 
[Texto] Agrega a la firma un campo con la provincia en la que se
realiza la firma.
En el caso de que se firme un XML, la codificación del
texto usado debe adecuarse al XML firmado.
signatureProductionPostalCode 
[Texto] Agrega a la firma un campo con el código postal en donde
se realiza la firma.
En el caso de que se firme un XML, la codificación del
texto usado debe adecuarse al XML firmado.
signatureProductionCountry 
[Texto] Agrega a la firma un campo con el país en el que se realiza
la firma.
En el caso de que se firme un XML, la codificación del
texto usado debe adecuarse al XML contrafirmado.
Encoding 
[Texto] Fuerza una codificación para la firma resultante. Un uso
incorrecto de esta propiedad puede provocar la
generación de una firma inválida.
commitmentTypeIndications 
[Entero] Indica el número de CommitmentTypeIndications que se
van a declarar. Estos son los motivos que se declaran para
la firma. Los valores concretos se especifican con
commitmentTypeIndicationnIdentifier y
commitmentTypeIndicationnDescription,
donde ‘n’ va desde 0 hasta el valor menos 1 indicado en
esta propiedad.
commitmentTypeIndication### nIde
ntifier
1 
Establece que el CommitmentTypeIndications número ### n
es “Prueba de origen”.
2 
Establece que el CommitmentTypeIndications número ### n
es “Prueba de recepción”.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
123
3 
Establece que el CommitmentTypeIndications número ### n
es “Prueba de entrega”.
4 
Establece que el CommitmentTypeIndications número ### n
es “Prueba de envío”.
5 
Establece que el CommitmentTypeIndications número ### n
es “Prueba de aprobación”.
6 
Establece que el CommitmentTypeIndications número ### n
es “Prueba de creación”.
commitmentTypeIndication### nDes
cription
[Texto] Establece la descripción del CommitmentTypeIndications
número ### n. Este atributo es opcional.
commitmentTypeIndication### nDoc
umentationReferences
[Texto] Lista de URL separadas por el carácter '|' que se aportan
como referencias documentales del
CommitmentTypeIndication número ### n (atributo
opcional).
Las URL de la lista no pueden contener el carácter '|' (ya
que este se usa como separador).
commitmentTypeIndication### nCom
mitmentTypeQualifiers
[Texto] Lista de indicadores textuales separados por el carácter
'|' que se aportan como calificadores adicionales del
CommitmentTypeIndication número n (atributo
opcional). Normalmente son OID.
Los elementos de la lista no pueden contener el carácter
'|' (ya que este se usa como separador).
allowSignLTSignature true Se permite la cofirma/contrafirma de firmas de archivo
longevo, a pesar de que estas no serán válidas
posteriormente.
false (o
cualquier
otro valor)
No se permite la cofirma/contrafirma de firmas de
archivo longevo.
Sin indicar Se consultará al usuario en caso de intentar
confirmarse/contrafirmarse una firma de archivo
longevo.
8.3 Configuración de firmas PAdES
Autofirma permite generar firmas PAdES acordes a las partes 2 y 3 del estándar ETSI TS 102 778
V1.2.1.
Los perfiles de firma soportados son los descritos en el mencionado estándar:
• PAdES-Básico

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
124
o Las firmas PAdES en las que se declara el subfiltro “adbe.pkcs7.detached”.
• PAdES-BES
o Las firmas PAdES en las que se declara el subfiltro “ETSI.CAdES.detached” son
PAdES-BES. Estas son las firmas por defecto.
• PAdES-EPES
o Las firmas PAdES en las que se configura política de firma son PAdES-EPES.
Hay que tener en cuenta que algunas de las firmas PAdES generadas por Autofirma también pueden
considerarse de tipo B-Level. Sin embargo, no se incluye un modo de operación que permita asegurar
que las firmas generadas sean acordes a este perfil.
Una salvedad en la realización de firmas PAdES con respecto al estándar, es que no se soporta la firma
de ficheros adjuntos o empotrados en los documentos PDF.
8.3.1 Algoritmos de firma
Para configurar el algoritmo de firma indicaremos el algoritmo de huella digital que se debe usar.
Autofirma soporta los siguientes algoritmos de huella para la generación de firmas PAdES:
• SHA512
• SHA384
• SHA256
• SHA1 (No recomendado)
El algoritmo de firma concreto que se utilizará aplicará el algoritmo de huella indicado y el cifrado
correspondiente para el tipo de certificado seleccionado por el usuario (RSA o ECC). Por ejemplo, si
se configurase el algoritmo SHA256 y el usuario seleccionase un certificado con claves de curva
elíptica (ECC), se generaría la firma usando el algoritmo SHA256withECDSA.
El estándar PAdES recomienda no usar el algoritmo SHA1 por no ser el más seguro.
El algoritmo más seguro y, por lo tanto, el recomendado para su uso es SHA512.
Si los certificados del usuario se encuentran en tarjeta inteligente, asegúrese de disponer de la última
versión de su controlador para garantizar la compatibilidad con estos algoritmos de firma. En caso de
que, aún así, no pueda utilizar este algoritmo con su tarjeta inteligente, consulte la información de
compatibilidad de su tarjeta y/o pruebe con otro algoritmo.
8.3.2 Operaciones no soportadas y notas de interés
• Las firmas PAdES no admiten contrafirmas.
• Una cofirma PAdES consiste en la adición de una firma adicional al documento PDF, sin que
se establezca ninguna relación de interdependencia con las firmas existentes.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
125
o Cofirmar un documento PDF es completamente equivalente a firmar un documento
PDF ya firmado.
• Versiones antiguas de Adobe Acrobat/Reader no soportan múltiples firmas cuando hay
firmas PAdES-BES.
• El formato PAdES sólo puede utilizarse sobre documentos PDF.
• No se firman los posibles adjuntos o empotrados que pudiese contener el documento PDF.
8.3.3 Creación de una firma visible
Autofirma permite la creación de firmas visibles dentro de un documento PDF, que lo son tanto en
pantalla (por ejemplo, usando Adobe Reader) como en papel una vez impreso el documento.
Para ello debemos indicar mediante parámetros adicionales la página o las páginas del documento
en donde situar la visualización de la firma y las coordenadas con la posición en la que debe
mostrarse. Sólo es posible establecer una posición para la firma visible, por lo que la posición será la
misma en todas las páginas en las que se muestre la firma.
Las coordenadas de la visualización se indican partiendo de la esquina inferior izquierda, según el
siguiente diagrama:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
126
Las coordenadas del campo de firma y la página en la que se desea insertar se establecen usando los
parámetros adicionales, por ejemplo:
signaturePositionOnPageLowerLeftX = 100
signaturePositionOnPageLowerLeftY = 100
signaturePositionOnPageUpperRightX = 200
signaturePositionOnPageUpperRightY = 200
signaturePages = 1,5,10--1
Una firma se puede mostrar en más de una página de un documento. Para ello se permite indicar un
listado de páginas y/o rangos de páginas en las que debe mostrarse. También se puede indicar
directamente que se muestre en todas las páginas del documento o en una nueva página al final de
este.
El parámetro signaturePages se utiliza para indicar la página o páginas donde insertar la rúbrica a
través del parámetro. Los valores que puede adoptar este parámetro son:
• all:
o Para indicar que la firma visible aparezca en todas las páginas del documento, se le
deberá de dar este valor al parámetro signaturePages.
• append:
o Si la firma visible debe de aparecer en una nueva página en blanco añadida al final
del documento, se le deberá de dar este valor al parámetro signaturePages.
• Página o listado de páginas:
o Si se desea indicar una página o varias páginas donde estampar la firma visible. Las
páginas se enumeran desde el número uno (1) y, si se utilizan valores negativos, se
empieza a contar desde el final del documento hacia atrás. Así, por ejemplo, el
signaturePositionOnPageLowerLeftX
signaturePositionOnPageLowerLeftY
signaturePositionOnPageUpperRightX
signaturePositionOnPageUpperRightY

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
127
número 1 designa a la primera página, el 2 a la segunda, el -1 a la última y el -2 a la
penúltima.
o Es posible indicar varias páginas listando las páginas separadas por comas. Por
ejemplo, el valor “1,4,7” estampa la imagen en las páginas 1, 4 y 7. También se
puede indicar un rango de páginas usando un guión. Por ejemplo, el valor “1-8”
estampará la imagen en las páginas de la 1 hasta la 8, ambas inclusive; y el valor “3-
-1”, estampará la imagen en las páginas de la 3 a la última.
o También es posible combinar páginas individuales con rangos de páginas. Por
ejemplo, el valor “3-6,8,-1”, indica que se estampará en las páginas de la 3 a la 6 y
también en la 8 y en la última.
Dentro del recuadro marcado por las coordenadas indicadas, es posible mostrar distintos elementos:
• Una imagen:
o En este caso debe indicarse qué imagen usar aportando el binario codificado en
Base64.
▪ La imagen de firma se configura a través del parámetro adicional
signatureRubricImage.
o La imagen que se inserta en el PDF es siempre JPEG. Si se proporciona la imagen
codificada en otro formato, se transformará a JPEG y se eliminarán sus transparencias
en caso de tenerlas. Si su imagen no es originalmente JPEG, se recomienda
transformarla primeramente para evitar que sea la aplicación la que realice la
transformación, lo que puede alterar su aspecto.
o IMPORTANTE: En la firma monofásica Autofirma App para Android no se puede
realizar la conversión de formato. Si desea que la firma visible sea compatible con
Android asegúrese de usar una imagen JPEG o utilice la firma trifásica.
o La imagen se adapta al recuadro marcado por las coordenadas para ocupar el mayor
espacio posible sin deformarse, por lo que se debería configurarse un tamaño de
firma adecuado para que la imagen se ajuste al mismo sin dejar espacio vacío.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
128
• Texto (que puede combinarse con una imagen)
o El texto se muestra a partir de la esquina superior izquierda del recuadro de firma,
introduciendo de forma automática los retornos de carro necesarios para adaptarse
al recuadro.
o El texto aparece siempre sobre la imagen indicada, si se indicó alguna.
o Es posible configurar el formato de texto mediante otras propiedades (tipo de letra,
tamaño, color, etc.).
o El texto puede incluir una serie de patrones que serán sustituidos en el momento de
la firma:
▪ $$SUBJECTCN$$ Nombre común (CN, Common Name) dentro del X.500
Principal del titular del certificado de firma. Salvo que se indique lo contrario,
los identificadores de usuario encontrados en esta propiedad se procesarán
para ocultar parte de sus caracteres.
▪ $$ISSUERCN$$ Nombre común (CN, Common Name) dentro del X.500
Principal del emisor del certificado de firma.
▪ $$CERTSERIAL$$ Número de serie del certificado de firma.
▪ $$SIGNDATE=PATRÓN$$ Fecha de la firma, donde PATRÓN debe indicar el
formato en el que debe mostrarse la fecha, siguiendo el esquema definido
por Oracle para la clase SimpleDateFormat. Así, por ejemplo, el texto
"Firmado el día $$SIGNDATE=dd/MM/yyyy$$." resultará finalmente en el
PDF como "Firmado el día 04/01/2016." suponiendo que la firma se realiza
el 04/01/2016.
▪ $$GIVENNAME$$ Nombre declarado del titular del certificado. Este valor
podría no aparecer en el certificado, en cuyo caso, el patrón se sustituirá por
cadena vacía.
▪ $$SURNAME$$ Apellidos declarados del titular del certificado. Este valor
podría no aparecer en el certificado, en cuyo caso, el patrón se sustituirá por
cadena vacía.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
129
▪ $$ORGANIZATION$$ Organización declarada del titular en el certificado.
Este valor podría no aparecer en el certificado, en cuyo caso, el patrón se
sustituirá por cadena vacía.
▪ $$PSEUDONYM$$ Seudónimo del certificado. Este valor podría no aparecer
en el certificado, en cuyo caso, el patrón se sustituirá por cadena vacía.
▪ $$OU$$ Unidad Organizativa (OU, Organization Unit) del certificado. Este
valor podría no aparecer en el certificado, en cuyo caso, el patrón se
sustituirá por cadena vacía.
▪ $$OUS$$ Listado de Unidades Organizativas del certificado. En caso de que
hubiese más de una, se presentarían todas separadas por “, ”. El certificado
podría no tener definidas Unidades Organizativas, en cuyo caso, el patrón se
sustituirá por cadena vacía.
▪ $$TITLE$$ Información sobre el puesto o rol del titular del certificado. Este
valor podría no aparecer en el certificado, en cuyo caso, el patrón se
sustituirá por cadena vacía.
▪ $$REASON$$ Razón por la que se firma el PDF, configurada la operación de
firma mediante la propiedad “signatureReason”. El patrón se sustituirá
por cadena vacía si no se hubiese establecido este valor.
▪ $$LOCATION$$ Ciudad en la que se firma el PDF, configurada la operación
de firma mediante la propiedad “signatureProductionCity”. El patrón
se sustituirá por cadena vacía si no se hubiese establecido este valor.
▪ $$CONTACT$$ Información de contacto del firmante del PDF, configurada la
operación de firma mediante la propiedad “signatureContact”. El patrón
se sustituirá por cadena vacía si no se hubiese establecido este valor.
Las propiedades para configurar la visualización de un texto de la firma se listan a continuación:
• layer2Text
o Texto que mostrar en la firma visible.
• layer2FontFamily
o Tipo de letra a usar en el texto de la firma visible.
• layer2FontSize
o Tamaño de letra a usar en el texto de la firma visible.
• layer2FontStyle
o Estilo del tipo de letra a usar en el texto de la firma visible. Cada estilo se identifica
mediante un valor numérico y es posible combinar estilos aplicando la operación
lógica o sobre los valores numéricos de cada uno de ellos.
• layer2FontColor
o Color del texto de la firma visible.
• obfuscateCertText

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
130
o Indica si deben ofuscarse o no los identificadores de usuario (como el DNI o NIE)
localizados automáticamente en el texto visible del PDF. Por defecto, se ofuscarán.
• signatureRotation
o Número de grados que rotar el texto y la imagen del campo de firma en sentido
horario.
• includeQuestionMark
o Indica si debe permitirse al lector de PDF mostrar junto a la firma una marca que
índique el resultado obtenido al validarla. La apariencia de esta marca depende
completamente del lector de PDF utilizado y es este el que decide si se muestra. Por
ejemplo, la marca podría no mostrarse cuando se definiese una imagen de fondo en
la firma.
Consulte el apartado 8.3.8 Parámetros adicionales para saber más sobre los valores que se pueden
asignar a las propiedades anteriores.
8.3.3.1 Configuración de la firma visible por usuario
Existe la posibilidad de que la configuración de la firma visible sea realizada por el usuario, y no por
la aplicación integradora. De este modo, es el usuario quien decide el área donde mostrar la firma y
su aspecto.
La aplicación podrá configurar que sea el usuario el que seleccione el área del documento en el que
desea insertar la firma visible PDF y si es obligatorio o no que seleccione un área. También podrá
configurar si quiere que el usuario seleccione el aspecto de la firma (texto, imagen, fuente, rotación,
etc.) o que se use el aspecto por defecto.
Para la configuración de la visible por parte del usuario se podrán utilizar los siguientes parámetros
adicionales:
• visibleSignature
o Permite configurar si se desea que el usuario seleccione el área de una firma visible
PDF y si es obligatorio o no el realizar una firma visible.
• visibleAppearance
o Permite configurar que sea el usuario el que seleccione el aspecto de una firma visible
PDF. Esta propiedad sólo tiene efecto cuando también se indica el parámetro
visibleSignature y siempre que el usuario termine seleccionado el área de firma.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
131
Consulte el apartado 8.3.8 Parámetros adicionales para saber más sobre estos parámetros de
configuración.
Esta funcionalidad únicamente está disponible en Autofirma. Autofirma App siempre usarán la
configuración de firma visible proporcionada por la aplicación y no darán la posibilidad de
configurarla al usuario.
8.3.4 Inserción de una imagen en un documento PDF antes de ser firmado
Autofirma permite, principalmente como ayuda para la inserción de Códigos Seguros de Verificación
(CSV), insertar una imagen en un documento PDF justo antes de firmarlo.
Para agregar una imagen debemos configurar una página y una zona dentro de esta para insertarla,
usando para ello el mismo sistema de coordenadas descrito en el apartado 8.3.3 Creación de una
firma visible, es decir, a partir de la esquina inferior izquierda. La imagen debe proporcionarse en
formato JPEG codificado en Base64.
Para indicar la página, podemos usar su número (empezando a contar desde uno como primera
página), usar -1 para referirnos a la última página del documento o 0 (cero) para insertar la imagen
en todas las páginas.
La imagen que se inserta en el PDF es siempre JPEG. Si se proporciona la imagen codificada en otro
formato, se transformará a JPEG y se eliminarán sus transparencias en caso de tenerlas. Si su imagen
no es originalmente JPEG, se recomienda transformarla primeramente para evitar que sea la
aplicación la que realice la transformación, lo que puede alterar su aspecto.
Debe tenerse en cuenta que el agregar imágenes al PDF puede invalidar firmas previas que tuviese el
documento. Asegúrese de no utilizar esta funcionalidad cuando el documento ya contenga firmas.
Es importante recalcar también que la imagen se deforma para adaptarse al recuadro marcado por
las coordenadas, siendo útil para evitar este efecto que ambos tengan la misma relación de aspecto.
Igualmente, no se proporcionan funcionalidades de rotado, por lo que si se quiere insertar una
imagen de lado (por ejemplo, en el margen de la página, esta debe venir rotada en origen.
Los parámetros adicionales para la inserción de imágenes son:
• image
o Imagen que se desea insertar en el PDF.
• imagePage
o Página donde desea insertarse la imagen.
• imagePositionOnPageLowerLeftX
o Coordenada horizontal inferior izquierda de la posición de la imagen.
• imagePositionOnPageLowerLeftY
o Coordenada vertical inferior izquierda de la posición de la imagen.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
132
• imagePositionOnPageUpperRightX
o Coordenada horizontal superior derecha de la posición de la imagen.
• imagePositionOnPageUpperRightY
o Coordenada vertical superior derecha de la posición de la imagen.
Consulte el apartado 8.3.8 Parámetros adicionales para obtener más información sobre los posibles
valores que pueden adoptar estos parámetros.
8.3.5 Firma de documentos PDF cifrados o protegidos con contraseña
Si bien es posible firmar documentos PDF cifrados o protegidos con contraseña, deben tenerse en
cuenta las siguientes limitaciones:
• No se pueden firmar como parte de un proceso de firma masiva documentos PDF cifrados.
• No se soporta la firma de PDF cifrados con certificados o con algoritmo AES256.
• Puede que no sea posible, en todos los casos, validar u obtener justificantes de validación de
documentos PDF cifrados o protegidos por contraseña usando la plataforma de validación
VALIDE del Gobierno de España.
o https://valide.redsara.es/valide/
8.3.6 Documentos certificados
Las firmas de un PDF pueden ser catalogadas como firmas de aprobación (por defecto) o firmas
certificadas.
Una firma de aprobación o de formulario se realiza sobre un campo de firma de formulario del
documento (preexistente o creado automáticamente en el momento de la firma). Un documento
puede contener tantas firmas de aprobación como necesite. Esta es la opción común de firma.
Una firma certificada o de documento se aplica sobre un campo de firma identificado como de
documento (preexistente o creado automáticamente en el momento de la firma). Un documento
puede contener un único campo de este tipo y por tanto una única firma certificada. En caso de
agregarse una firma certificada al documento, esta debería ser la primera que se agregue.
Independientemente de sus nombres, ambos tipos de firma aplican al conjunto de datos de todo el
documento, nunca sólo a los datos de un formulario. Sólo cambia la designación del campo en el que
se almacenan.
Una firma certificada restringe modificaciones posteriores sobre el documento. Las modificaciones
permitidas vendrán determinadas por el nivel de certificación aplicado a la firma. Autofirma permite
configurar el nivel de certificación de una firma por medio del parámetro certificationLevel.
Los tipos de firma que puede crear son:
• Firma sin certificar.
o Esta sería una firma de aprobación.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
133
o Este es el tipo de firma generada por defecto por Autofirma y se configura con el
valor: 0
• Firma certificada de autor.
o Tras este tipo de firma certificada, no se permite ningún cambio posterior en el
documento.
o Se configura con el valor: 1
• Firma certificada de autor para formularios.
o Tras este tipo de firma certificada, se permite el relleno de los campos de
formulario, la adición de páginas y la creación de firmas de aprobación.
o Se configura con el valor: 2
• Firma certificada común.
o Tras este tipo de firma certificada, se permite el relleno de los campos de
formulario, la adición de páginas y la creación de firmas de aprobación y agregar
comentarios.
o Se configura con el valor: 3
8.3.7 Comprobación de PDF Shadow Attack
Existe una vulnerabilidad en el formato PDF que hace posible que una revisión de un documento
altere la presentación de un elemento de una revisión anterior, incluso si está firmada. Esto quiere
decir que se podría modificar un PDF firmado de tal forma que parezca a simple vista que se firmó
algo distinto a lo que realmente se firmó. Alterar de esta forma el documento firmado es lo que se
conoce como PDF Shadow Attack y, aunque el propio formato proporciona los medios para
comprobar cuál es el contenido que realmente se firmó, un firmante posterior deberá tener cuidado
de no firmar un documento alterado creyendo que alguien firmó anteriormente ese mismo
contenido.
Autofirma 1.8 y superiores incorpora la comprobación de PDF Shadow Attack en su operativa de
validación de firmas. Primeramente, para que se validen las firmas que se van a multifirmar se debe
habilitar la validación de firmas previas mediante el parámetro adicional checkSignatures, tal
como se describe en el apartado 7.6 Validación de firmas previas.
Para configurar la comprobación de PDF Shadow Attack se proporciona la propiedad
allowShadowAttack, de tal forma que al validar una firma PDF pueden ocurrir los siguientes casos
según su valor:
• Si se establece a true, se omite la validación del PDF Shadow Attack durante la validación de
las firmas previas.
• Si se establece a false (o cualquier otro valor) y si se sospecha que el PDF puede haber sido
modificado, se bloquea la firma dando por hecho que el PDF ha sido modificado.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
134
• Si no se establece ningún valor y se sospecha que el PDF puede haber sido modificado, se
muestra al usuario un diálogo solicitándole que compruebe el PDF y confirme que desea
firmarlo a pesar de la sospecha de que haya sido modificado.
Ya que la comprobación del PDF Shadow Attack es computacionalmente costosa y no garantiza que
se haya una modificado maliciosamente el documento, sólo se aplicará la comprobación sobre un
número de páginas determinado. El número de páginas por defecto es de 10, pero la aplicación puede
configurar este número mediante la propiedad pagesToCheckShadowAttack, que puede adoptar
los siguientes valores:
• Entero positivo: Número de páginas que se comprobarán.
• Entero negativo o 0: No se comprobarán modificaciones de tipo PDF Shadow Attack.
• all: Todas las páginas.
En el caso de la firma trifásica, la carga de la comprobación del PDF recae en el propio servidor, así
que el servicio puede limitar a través de su configuración el número de páginas máximo que se
deberán comprobar. Consulte el apartado 5.3.2.1 Configuración del servicio trifásico para saber más
de la configuración del servicio.
La comprobación del PDF Shadow Attack también detectaría sin diferenciarlo cualquier cambio en los
valores de un formulario realizados después de firmar. Si el integrador o el usuario aceptasen que se
permiten cambios en los valores de los formularios después de firmar, estará aceptando que el
documento puede cambiar, por lo que se desactivará la comprobación de PDF Shadow Attack.
8.3.8 Parámetros adicionales
A continuación, se listan las propiedades adicionales que pueden configurarse en las firmas en
formato PAdES con Autofirma.
Es posible que el uso de parámetros no contemplados en las siguientes tablas provoque otros
cambios de funcionamiento. No obstante, no se dará soporte al aplicativo si se usan parámetros no
documentados, asumiendo el integrador todo el riesgo y responsabilidad derivados del uso de
parámetros o valores distintos de los aquí descritos.
Nombre del parámetro Valores
posibles
Descripción
includeOnlySignningCertifica
te
true Indica que debe incluirse en la firma únicamente el
certificado del firmante.
false Indica que debe incluirse en la firma toda la cadena de
certificación del certificado firmante. Valor por defecto.
alwaysCreateRevision true Siempre creará una revisión al firmar. Requiere que el
documento cumpla la especificación PDF 1.7 (ISO 32000-
1:2008)

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
135
false No creará revisión en la primera firma y sí en las
siguientes.
image [Texto
Base64]
Imagen que insertar en el PDF. Esta opción sólo se puede
usar en la primera firma del documento.
imagePage [Entero
positivo]
Insertar imagen en el número de página indicado.
0 Insertar en todas las páginas.
-1 Insertar imagen en la última página.
imagePositionOnPageLowerLeft
X
[Entero
positivo]
Coordenada horizontal desde la esquina inferior
izquierda de la página a la esquina inferior izquierda de
la imagen.
imagePositionOnPageLowerLeft
Y 
[Entero
positivo]
Coordenada vertical desde la esquina inferior izquierda
de la página a la esquina inferior izquierda de la imagen.
imagePositionOnPageUpperRigh
tX
[Entero
positivo]
Coordenada horizontal desde la esquina inferior
izquierda de la página a la esquina superior derecha de
la imagen.
imagePositionOnPageUpperRigh
tY 
[Entero
positivo]
Coordenada vertical desde la esquina inferior izquierda
de la página a la esquina superior derecha de la imagen.
attach [Texto
Base64]
Contenido a añadir como adjunto al PDF. Requiere
establecer attachFileName.
attachFileName [Texto] Nombre del que asignar al fichero adjunto.
attachDescription [Texto] Descripción del documento adjunto.
certificationLevel 0 Firma sin certificar. Esta sería una firma de aprobación.
Es el valor por defecto.
1 Firma certificada de autor. Tras este tipo de firma
certificada, no se permite ningún cambio posterior en el
documento (no se pueden agregar firmas ni rellenar
formularios).
2 Firma certificada de autor para formularios. Tras este
tipo de firma certificada sólo se permiten acciones de
rellenado de formularios, firma, adición de páginas.
3 Firma certificada común. Tras este tipo de firma
certificada sólo se permiten acciones de rellenado de
formularios, firma, adición de páginas y comentarios.
compressPdf true Comprime el PDF firmado para que ocupe menos
tamaño. Sólo se aplica si se trata de un PDF v4 o
superior. Este es el valor por defecto.
false Nunca se comprime el PDF firmado.
pdfVersion -1 Respetar la versión del documento PDF firmado.
2 Se declara que la versión del PDF de salida es 1.2.
3 Se declara que la versión del PDF de salida es 1.3.
4 Se declara que la versión del PDF de salida es 1.4.
5 Se declara que la versión del PDF de salida es 1.5.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
136
6 Se declara que la versión del PDF de salida es 1.6.
7 Se declara que la versión del PDF de salida es 1.7. Valor
por defecto.
signatureSubFilter [Texto] Subfiltro declarado. Por defecto se utiliza el de las firmas
BES (“ETSI.CAdES.detached”). Puede usarse la
cadena “adbe.pkcs7.detached” para crear firmas
basicas.
signatureField [Texto] Nombre del campo de firma preexistente en el que
insertar la firma.
signaturePages [Cadena] Página o rango de páginas donde estampar la firma
visible. Para más detalles consultar el apartado “8.3.3
Creación de una firma visible”.
signaturePositionOnPageLower
LeftX
[Entero
positivo]
Coordenada horizontal desde la esquina inferior
izquierda de la página a la esquina inferior izquierda del
campo de firma visible.
signaturePositionOnPageLower
LeftY 
[Entero
positivo]
Coordenada vertical desde la esquina inferior izquierda
de la página a la esquina inferior izquierda del campo de
firma visible.
signaturePositionOnPageUpper
RightX 
[Entero
positivo]
Coordenada horizontal desde la esquina inferior
izquierda de la página a la esquina superior derecha del
campo de firma visible.
signaturePositionOnPageUpper
RightY
[Entero
positivo]
Coordenada vertical desde la esquina inferior izquierda
de la página a la esquina superior derecha del campo de
firma visible.
signatureRubricImage [Texto
Base64]
Imagen que mostrar en el campo de firma visible.
layer2Text [Texto] Texto que mostrar en el campo de firma visible.
layer2FontFamily 0 El texto de la firma visible se mostrará con fuente
Courier. Este es el valor por defecto.
1 El texto de la firma visible se mostrará con fuente
Helvética.
2 El texto de la firma visible se mostrará con fuente Times
Roman.
3 El texto de la firma visible se mostrará con fuente
Symbol.
layer2FontSize [Entero
positivo]
Tamaño de fuente del texto de la firma visible.
layer2FontStyle 0 Texto de la firma visible sin estilo. Valor por defecto.
1 Texto de la firma visible en negrita.
2 Texto de la firma visible en cursiva.
4 Texto de la firma visible subrayado.
8 Texto de la firma visible tachado.
layer2FontColor black El texto de la firma visible será de color negro. Este es el
valor por defecto.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
137
white El texto de la firma visible será de color blanco.
gray El texto de la firma visible será de color gris.
lightGray El texto de la firma visible será de color gris claro.
darkGray El texto de la firma visible será de color gris oscuro.
red El texto de la firma visible será de color rojo.
pink El texto de la firma visible será de color rosa.
obfuscateCertText true Se ofuscan los identificadores de usuario extraidos del
CN o DN del certificado y mostrados en la firma visible
PDF. No se ofuscan los datos de los certificados de
seudónimo. Este es el valor por defecto.
false No se ofusca la información de los certificados.
obfuscationMask [Texto] Criterios de ofuscación de los identificadores de usuario
en las firmas visibles PDF. Debe mostrar el siguiente
patrón:
caracter;longitudDigitos;posiciones;de
splazamiento
En este patrón:
• caracter: Es el carácter que usar para ofuscar
caracteres.
• longitudDigitos: Número mínimo de dígitos que
debe tener una cadena de texto para que se considere
que debe ofuscarse.
• posiciones: Listado de posiciones que indica qué
caracteres deben mostrarse. El listado se expresa con
una sucesión de true/false separados por comas
(','), en donde true indica que el carácter debe
mostrarse y false que no.
• desplazamiento: Indica si se admite el
desplazamiento de posiciones de la máscara para
mostrar todos los caracteres indicados (true) o si
esta debe respetarse (false).
visibleSignature default Se realizará firma visible PDF si se han proporcionado los
parámetros con el área y la página de firma. Este es el
valor por defecto.
want El usuario debe seleccionar el área de firma visible. En
caso de cancelar el proceso:
• Si la petición también incluye los parámetros de área
de firma visible (posición y página), se usarán dichos
parámetros y se continuará con el proceso de firma.
• Si la petición no incluye los parámetros de área de
firma visible, se cancelará el proceso de firma.
optional El usuario podrá elegir si desea incluir o no el área de
firma visible. En caso de cancelar el proceso:
• Si la petición también incluye los parámetros de área
de firma visible (posición y página), se usarán dichos
parámetros y se continuará con el proceso de firma.
• Si la petición no incluye los parámetros de área de
firma visible, se realizará una firma no visible.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
138
visibleAppearance default Se aplicará el aspecto por defecto para la firma visible
PDF o, si se proporcionaron los parámetros de aspecto,
el aspecto configurado. Este es el valor por defecto.
custom El usuario puede elegir el aspecto de la firma visible. En
caso de cancelar el proceso, se usará el aspecto por
defecto.
signatureRotation 0 No rota el campo de firma. Este es el valor por defecto.
90 Rota 90 grados en sentido horario el campo de firma.
180 Rota 180 grados en sentido horario el campo de firma.
270 Rota 270 grados en sentido horario el campo de firma.
includeQuestionMark true Permitirse al lector de PDF mostrar junto a la firma
visible una marca que índique el resultado obtenido al
validarla. La apariencia de esta marca depende
completamente del lector de PDF utilizado y es este el
que decide si se muestra. Por ejemplo, la marca podría
no mostrarse cuando se definiese una imagen de fondo
en la firma.
false No permite mostrar la marca con el resultado de la
validación. Este es el valor por defecto.
signReason [Texto] Razón por la que se realiza la firma.
signatureProductionCity [Texto] Ciudad en la que se realiza la firma.
signerContact [Texto] Información de contacto del firmante.
signerClaimedRoles [Texto] Listado de roles declarados por el firmante (separados
por “|”)
policyIdentifier [URL] Identificador de la política de firma (normalmente una
URL hacia la política en formato XML procesable),
necesario para generar firmas XAdES-EPES.
policyIdentifierHash [Texto
Base64]
Huella digital de la política de firma. Es obligatorio
indicar esta propiedad si el valor indicado en
policyIdentifier no es universalmente accesible.
Si se da valor a esta propiedad es obligatorio también
dar valor al parámetro
policyIdentifierHashAlgorithm.
policyIdentifierHashAlgorith
m
SHA1 Indica que la huella digital indicada en el parámetro
policyIdentifierHash se calculó mediante el
algoritmo SHA1.
SHA-256 Indica que la huella digital indicada en el parámetro
policyIdentifierHash se calculó mediante el
algoritmo SHA-256.
SHA-384 Indica que la huella digital indicada en el parámetro
policyIdentifierHash se calculó mediante el
algoritmo SHA-384.
SHA-512 Indica que la huella digital indicada en el parámetro
policyIdentifierHash se calculó mediante el
algoritmo SHA-512.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
139
policyQualifier [URL hacia
documento]
URL hacia el documento que contiene una descripción
textual de la política de firma.
ownerPassword [Texto] Contraseña de apertura del PDF. No se soporta la firma
de documentos PDF cifrados con certificados o algoritmo
AES-256.
mandatoryCertSelection true Muestra el diálogo de selección de certificado para que
el usuario pueda seleccionarlo en las distintas
operaciones de firma o selección de certificado. Este es
el valor por defecto.
false Evita que se muestre el diálogo de selección de
certificado al usuario cuando sólo hay uno disponible en
el almacén o tras aplicar los filtros de certificado.
headless true Evita que se muestren diálogos gráficos al usuario
(como, por ejemplo, el diálogo de selección de
certificado cuando no es necesario o un diálogo de
confirmación en la firma).
false Permite que se muestren diálogos gráficos al usuario
durante la operación. Este es el valor por defecto.
allowSigningCertifiedPdfs true Permite la firma de documentos PDF certificados. El
resultado podría invalidar firmas anteriores del PDF.
false Produce un error al firmar documentos PDF certificados.
Se omite En caso de detectar que el documento PDF de entrada
está certificado, se aplicará uno de los siguientes
comportamientos:
• Si la firma es monofásica (formato “PAdES”), se
advertirá al usuario de que la firma podría invalidar
firmas anteriores y se le permitirá elegir si firmar o
cancelar la operación.
• Si la firma es trifásica (formato “PAdEStri”), fallará la
operación de firma.
Tenga en cuenta que, Autofirma App, las firmas podrían
ser trifásicas independientemente del nombre de
formato indicado.
allowCosigningUnregisteredSi
gnatures
true Permite firmar documentos PDF con firmas previas no
registradas.
false No permite firmar documentos PDF con firmas previas
no registradas.
signingCertificateV2 true Se utiliza el atributo signingCertificateV2 en las
firmas.
false Se utiliza el atributo signingCertificateV1 en las
firmas.
Se omite Se utiliza el atributo signingCertificateV1 en las
firmas que utilicen el algoritmo de huella SHA1 y
signingCertificateV2 en el resto.
signReservedSize [Entero
positivo]
Tamaño máximo en bytes de la firma que se incorporará
al PDF. Por defecto, 27000.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
140
allowShadowAttack true No se realizará la comprobación de PDF Shadow Attack
durante la validación de las firmas previas
(checkSignatures=true).
false Se realizará la comprobación de PDF Shadow Attack
durante la validación de las firmas previas
(checkSignatures=true) y, en caso de detectarse,
se dará la firma por inválida. Este valor bloqueará
también la operación si se detecta cualquier
modificación de un campo de formulario posterior a la
última firma.
Se omite Se realizará la comprobación de PDF Shadow Attack
durante la validación de las firmas previas
(checkSignatures=true) y, en caso de detectarse,
se consultará al usuario si se debe continuar con la
operación.
allowModifiedForm true No se realizará la comprobación de cambios en los
formularios durante la validación de las firmas previas
(checkSignatures=true). Este valor desactiva
también la validación de PDF Shadow Attack, ya que se
estarán permitiendo cambios en el documento
posteriores a la firma.
false Se realizará la comprobación de cambios en los
formularios del documento durante la validación de las
firmas previas (checkSignatures=true) y, en caso
de detectarse, se dará la firma por inválida.
Se omite Se realizará la comprobación de cambios en los
formularios del documento durante la validación de las
firmas previas (checkSignatures=true) y, en caso
de detectarse, se consultará al usuario si se debe
continuar con la operación. Si el usuario acepta la
operación, estará aceptando cambios en documento
posteriores a la firma, por lo que no se realizará la
comprobación de PDF Shadow Attack.
8.4 Configuración de firmas de factura electrónica
El formato de factura electrónica configura todas las propiedades imprescindibles para generar una
firma válida de factura, como la política de firma o las referencias a los nodos, por lo que no deberán
establecerse manualmente.
Este formato sólo puede utilizarse sobre facturas electrónicas y éstas sólo admiten la operación de
firma. No permiten cofirmarlas ni contrafirmarlas.
La política de firma utilizada por defecto para firmar es la 3.1, aunque puede configurarse para el uso
de la política 3.0 mediante los parámetros adicionales “policyIdentifier” y
“policyIdentifierHash”.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
141
8.4.1 Operaciones no soportadas y notas de interés
• Las facturas electrónicas se firman con el formato XAdES Enveloped, pero con unas
particularidades concretas que no es posible replicar configurando directamente el formato
XAdES en Autofirma. Es necesario utilizar el formato FacturaE para la firma de facturas.
• El formato FacturaE sólo puede utilizarse sobre facturas electrónicas acordes al estándar.
• Las facturas electrónicas no soportan las operaciones de cofirma ni contrafirma. Si se intenta
hacer una operación de cofirma o contrafirma sobre una factura electrónicas se notificará que no
es posible porque ésta ya cuenta con una firma.
8.4.2 Algoritmos de firma
Para configurar el algoritmo de firma indicaremos el algoritmo de huella digital que se debe usar.
Autofirma soporta los siguientes algoritmos de huella para la firma de facturas electrónicas:
• SHA512
• SHA384
• SHA256
• SHA1 (No recomendado)
El algoritmo más seguro, y por lo tanto el recomendado para su uso es SHA512.
El algoritmo de firma concreto que se utilizará aplicará el algoritmo de huella indicado y el cifrado
correspondiente para el tipo de certificado seleccionado por el usuario (RSA o ECC). Por ejemplo, si
se configurase el algoritmo SHA256 y el usuario seleccionase un certificado con claves de curva
elíptica (ECC), se generaría la firma usando el algoritmo SHA256withECDSA.
8.4.3 Parámetros adicionales
Aquí se listan los parámetros adicionales que acepta el formato FacturaE para la configuración de la
operación y de la firma electrónica generada.
Es posible que el uso de parámetros no contemplados en las siguientes tablas provoque otros
cambios de funcionamiento. No obstante, no se dará soporte al aplicativo si se usan parámetros no
documentados, asumiendo el integrador todo el riesgo y responsabilidad derivados del uso de
parámetros o valores distintos de los aquí descritos.
Nombre del parámetro Valores posibles Descripción
signatureProductionCi
ty 
[Texto] Agrega a la firma un campo con la ciudad en la que
se realiza la firma.
signatureProductionPr
ovince
[Texto] Agrega a la firma un campo con la provincia en la
que se realiza la firma.
signatureProductionPo
stalCode
[Texto] Agrega a la firma un campo con el código postal en
donde se realiza la firma.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
142
signatureProductionCo
untry
[Texto] Agrega a la firma un campo con el país en el que se
realiza la firma.
xadesNamespace [URL] URL de definición del espacio de nombres de XAdES
(el uso de esta propiedad puede condicionar la
declaración de versión de XAdES).
Si se establece esta propiedad es posible que se
necesite establecer también el parámetro
signedPropertiesTypeUrl para evitar
incoherencias en la versión de XAdES.
signedPropertiesTypeU
rl
[URL] URL de definición del tipo de las propiedades
firmadas (Signed Properties) de XAdES. Si se
establece esta propiedad es posible que se
necesite establecer también el parámetro
xadesNamespace para evitar incoherencias en
la versión de XAdES.
Si no se establece se usa el valor por defecto:
http://uri.etsi.org/01903#SignedPr
operties.
signerClaimedRoles Emisor Declara que el firmante es el emisor de la factura.
Este es el valor por defecto.
receptor Declara que el firmante es el receptor de la factura.
tercero Declara que el firmante es un tercero con respecto
a la factura.
supplier Declara que el firmante es el emisor de la factura.
Este es el valor por defecto.
customer Declara que el firmante es el receptor de la factura.
third party Declara que el firmante es un tercero con respecto
a la factura.
policyIdentifier http://www.facturae.e
s/politica_de_firma_f
ormato_facturae/polit
ica_de_firma_formato_
facturae_v3_1.pdf
Identificador de la política de firma 3.1. Este es el
valor por defecto.
http://www.facturae.e
s/politica de firma
formato
facturae/politica de
firma formato
facturae v3_0.pdf
Identificador de la política de firma 3.0.
policyIdentifierHash Ohixl6upD6av8N7pEvDAB
hEL6hM=
Huella digital para configurar la política de firma 3.1.
Este es el valor por defecto.
xmfh8D/Ec/hHeE1IB4zPd
61zHIY=
Huella digital para configurar la política de firma 3.0.
policyIdentifierHashA
lgorithm
SHA1 Indica que la huella digital indicada en el parámetro
policyIdentifierHash se calculó mediante
el algoritmo SHA1.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
143
### 9 ### Compatibilidad con dispositivos móviles
Una aplicación web puede utilizar AutoScript para llamar a Autofirma y que este realice las
operaciones de firma que se soliciten. Para que estas operaciones puedan ejecutarse, es necesario
que se haya instalado previamente en el equipo la aplicación correspondiente a ese entorno. La
aplicación de firma puede ser:
• Autofirma.
o En equipos de sobremesa (Windows, Linux o macOS).
• Autofirma App para Android.
o En disposivos Android.
• Autofirma App para iOS.
o En dispositivos iOS (iPhone y iPad).
No todas estas aplicaciones funcionan de igual modo y las aplicaciones móviles no soportan todas las
operaciones que soporta Autofirma. Por este motivo, un desarrollador que desee que su despliegue
funcione en entornos móviles deberá tener en cuenta una serie de restricciones a la hora de intregar
las funciones en la aplicación.
9.1 Requisitos de despliegue
Para que nuestro de Autofirma sea compatible con los clientes móviles, deben desplegarse también
los servicios auxiliares de comunicación y de firma trifásica. Para ello se desplegarse los archivos:
• afirma-signature-storage.war
• afirma-signature-retriever.war
• afirma-server-triphase-signer.war
La descripción de estos servicios puede encontrarse en el apartado 5.3 Servicios .
Advertencia: Es obligatorio que la página web y los servicios se desplieguen para el acceso por
HTTPS con un certificado SSL de confianza, vigentes y emitido para el dominio desde el que se
acceda.
Además de su despliegue y configuración, es necesario indicar a Autofirma donde se encuentran los
servicios desplegados:
• Para establecer la ubicación de los servicios de comunicación se utilizará el método
setServlets. La descripción del uso de este método se realiza en el apartado 6.1.2
Configuración de los servicios auxiliares de comunicación.
• Para establecer la ubicación del servicio de firma trifásica se utilizará el parámetro adicional
serverUrl, descrito en el apartado ANEXO II Firma trifásica.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
144
9.2 Limitaciones
Debe tenerse en cuenta que las versiones actuales de Autofirma App no implementan toda la
funcionalidad del Autofirma, y que las aplicaciones de Android e iOS cuentan con distinta
funcionalidad entre sí. Las limitaciones existentes, ya sea porque aún no se han desarrollado o por la
imposibilidad de hacerlo para ese sistema concreto, son las siguientes:
9.2.1 Limitaciones de formato
Las aplicaciones de Android y iOS son capaces de realizar firmas en todos los formatos avanzados
soportados por Autofirma:
• CAdES.
• XAdES.
• PAdES.
• FacturaE.
Sin embargo, salvo en casos concretos, las firmas en los dispositivos móviles siempre se realizarán a
través del servicio de firma trifásica, por lo cual la firma en dispositivo móvil siempre requerirá:
• El despliegue de este servicio tal como se describe en el apartado 5.3.2 Servicios de firma
trifásica y firma de lotes.
• Configurar en los parámetros adicionales de las operaciones de firma la URL del servicio
anterior a través de la propiedad “serverUrl”.
Autofirma App realizará siempre la operación de firma trifásica, independientemente de que se
configure el nombre de formato común (XAdES, PAdES…) o el trifásico (XAdEStri, PAdEStri). Las únicas
excepciones son los formatos de firma CAdES y PAdES con el Cliente de firma Android, que sí realizará
la firma sin depender del servidor trifásico cuando se use el nombre monofásico de los formatos.
Si desea realizar una firma visible PAdES desde Autofirma App para Android con una imagen de
rúbrica, asegúrese de utilizar una imagen JPEG. En caso de no poder asegurarlo, configure
expresamente el formato trifásico.
9.2.2 Limitaciones funcionales
Autofirma App no permite la configuración del almacén de claves que deben utilizar ni su
comportamiento:
• Autofirma App para Android siempre usará el almacén del sistema o un DNIe por NFC (si se
encuentra habilitada esta opción en la aplicación).
• Autofirma App para iOS siempre usará el almacén de la propia aplicación.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
145
Este comportamiento hace que ambas aplicaciones ignoren las llamadas a los siguientes métodos de
configuración:
• setKeyStore(keystore)
• setStickySignatory(sticky)
También se ignorarán las propiedades para la configuración de filtros de certificados (filters) y la
selección automática de certificados cuando sólo haya uno en el almacén (mandatoryCertSelection y
headless).
Por otra parte, las aplicaciones móviles no implementan las operaciones auxiliares para la carga de
ficheros y la aplicación iOS tampoco soporta la función de guardado:
• getFileNameContentBase64(title, extension, description, filePath,
successCallback, errorCallback)
• getMultiFileNameContentBase64(title, extension, description,
filePath, successCallback, errorCallback)
• function saveDataToFile(dataB64, title, fileName, extension,
description, successCallback, errorCallback)
En el apartado 6.7 Operaciones de gestión de ficheros, se plantean casos de uso alternativos para
evitar el uso de estos métodos.
Las aplicaciones móviles tampoco son compatibles con la opción de llamar al método de firma sin
proporcionarle los datos a firmar para que sea la propia aplicación la que se los solicite al usuario. Los
datos deben proporcionárselos siempre la aplicación.
9.2.3 Limitaciones de entono
Las aplicaciones móviles sólo permiten las conexiones sin cifrado SSL a los dominios indicados de
antemano. Sin embargo, Autofirma Apppuede conectarse con cualquier dominio, así que no
establece estas excepciones. Para que nuestro despliegue sea compatible con Autofirma App,
deberá accederse a nuestra web siempre a través de HTTPS.
9.3 Recomendaciones de despliegue
Más allá de lo anteriormente expuesto, existen una serie de limitaciones en los entornos móviles que
hacen que un despliegue que funcione correctamente en un equipo con Autofirma pueda presentar
problemas con un dispositivo y Autofirma App. Buena parte de estas limitaciones viene por la
necesidad de utilizar la comunicación por servidor intermedio, el que se detengan los JavaScripts
cuando el navegador está en segundo plano y varias restricciones de seguridad impuestas por algunos
navegadores, como Google Chrome (no permite varias llamadas a una aplicación externa sin
interacción del usuario entre ellas y no permite que se haga esa llamada pasados unos segundos

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
146
desde la interacción del usuario). Por este motivo, se recogen aquí una serie de recomendaciones
para garantizar el correcto funcionamiento de las aplicaciones:
• Forzar siempre el uso de firma trifásica:
o Esto se consigue utilizando los nombres de formato de firma trifásica (CAdEStri,
PAdEStri, etc.) e indicando la URL del servidor trifásico a través de la propiedad
“serverUrl”. De esta forma se garantiza que las firmas generadas por todas las
aplicaciones sean siempre iguales, ya que la firma se ejecuta en servidor (que será el
mismo para todas las aplicaciones), mientras que en la firma monofásica la ejecuta
cada aplicación y podría haber diferencias en las implementaciones de los formatos
de firma entre distintas versiones de las aplicaciones cliente.
• Configurar un gestor de documentos apropiado y utilizar referencias a los datos:
o Cuando se proporciona en la llamada de firma los datos a firmar y estos no pueden
ser transferidos directamente a la aplicación de firma, se subern al servidor
intermedio y la aplicación de firma los descarga de este. Sin embargo, en los
dispositivos móviles la subida de los datos puede quedar detenida en el momento de
llamar a la aplicación de firmam cuando el navegador web queda en segundo plano.
Por otro lado, si se suben los datos antes de la llamada a la aplicación, es probable
que a partir de cierto tamaño la subida requiera cantidad de tiempo suficiente como
para que la llamada a la aplicación de firma se retrase, lo que hará que las medidas
de seguridad de algunos navegadores, como Google Chrome, bloqueen la apertura
de la aplicación. Para evitar estos problemas, en lugar de proporcionar al cliente los
datos a firmar, se debería proporcionar únicamente la referencia a los datos y
configurar a través de la propiedad “document.manager” del servicio de firma
trifásica un gestor de documentos capaz de obtener los datos a partir de estas
referencias. Idealmente, se debería programar un gestor de documentos optimizado
para su aplicación, pero se podría utilizar alguno de los ya disponibles, como el
es.gob.afirma.triphase.server.document.FileSystemDocumentManager, que
carga los datos de un fichero en un directorio configurado en servidor y almacena la
firma en un directorio distinto.
o El uso de
es.gob.afirma.triphase.server.document.SelfishDocumentManager no sería
válido ya que este no obtiene los datos a partir de una referencia, sino que requiere
que se le envíen los datos completos.
o Si nuestra aplicación requiere que sea el usuario el que proporcione los datos, se
podría organizar el trámite de firma para que primeramente se suban esos datos al
servidor a través de un formulario web y, una vez cargados, se le presente al usuario
el botón para iniciar el proceso de firma, en donde se indicará la referencia a esos
datos ya cargados.
• Evitar múltiples peticiones de firma:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
147
o En dispositivos móviles cada nueva operación de firma implica una nueva llamada al
cliente de firma. Sin embargo, algunos navegadores, como Google Chrome en
dispositivos móviles, bloquean el que se puedan hacer llamadas consecutivas a una
aplicación externa. Esto significa que, si tratamos de encadenar varias operaciones
de firma consecutivas, por ejemplo, agregando la llamada a la operación de firma en
la función callback que se ejecuta al finalizar una operación anterior, sólo se ejecutará
la primera operación. Para evitar este problema, si necesita ejecutar múltiples
operaciones de firma, utilice la funcionalidad de firma de lotes descrita en el
apartado 6.5 Firma de lotes predefinidos.
9.4 Notificaciones al usuario
Es obligatorio que el usuario tenga instalado Autofirma App para Android o iOS, según corresponda,
antes de realizar una operación de firma desde su dispositivo móvil. Se recomienda por ello que se
advierta al usuario antes de alcanzar la operación de la firma de la necesidad de instalar esta
aplicación. AutoScript facilita a las aplicaciones la labor de detectar el entorno del usuario mediante
las siguientes funciones:
• function isAndroid()
o Detecta si el usuario accede a la página web desde un dispositivo Android.
• function isIOS()
o Detecta si el usuario accede a la página web desde un iPod, iPhone o iPad.
Al detectar que el usuario accede a la aplicación desde Android o iOS, la aplicación puede, por
ejemplo, mostrarle al usuario el enlace para la instalación de la aplicación desde la tienda de
aplicaciones correspondiente
Un ejemplo del uso de estas funciones sería:
// Si es Android, mostramos el mensaje de advertencia para Android
if (AutoScript.isAndroid()) {
document.getElementById(“androidWarning”).style.display = "block";
}
// Si es iOS, mostramos el mensaje de advertencia para iOS
else if (AutoScript.isIOS()) {
document.getElementById(“iOSWarning”).style.display = "block";
}
El integrador sería el responsable de preparar esos mensajes de advertencia.
También se puede agregar a la página web los enlaces para la descarga de las aplicaciones:
• Enlace a Google Play:
o <a
href="https://play.google.com/store/apps/details?id=es.gob.afi
rma"><img alt="Get it on Google Play"

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
148
src="https://play.google.com/intl/en_us/badges/images/generic/
es-play-badge-border.png" style="width: 140px;"/></a>
• Enlace a la App Store:
o <a href="https://itunes.apple.com/us/app/cliente-firma-
movil/id627410001?mt=8&uo=4" target="itunes_store"
style="display:inline-
block;overflow:hidden;background:url(https://linkmaker.itunes.
apple.com/assets/shared/badges/es-es/appstore-lrg.svg) no-
repeat;width:135px;height:40px;background-size:contain;"></a>

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
149
### 10 ### Problemas conocidos
Se han detectado una serie de situaciones problemáticas asociadas al uso de Autofirma y sus
servicios. Un usuario o aplicación puede verse afectado por estas situaciones si obtiene los
siguientes errores al utilizar Autofirma:
• No se puede acceder al almacén de claves de Firefox 49.0 y superiores
• No se puede acceder al almacén de claves de Firefox 58
• No se detecta la inserción/extracción del DNIe en el lector (u otra tarjeta inteligente)
• Falla la operación de firma con DNIe o una tarjeta de la FNMT
• No se permite la firma de PDF con ciertos certificados
• El servicio de firma trifásica genera un error al realizar firmas XAdES en servidores JBoss
• Las firmas con DNIe requieren que se introduzca el PIN del DNIe por cada operación de
firma
• No aparece el certificado de firma de un DNIe
El certificado de firma del DNIe es un certificado opcional que no se incluirá nunca en los DNIe de los
menores de edad y podría tampoco incluirse cuando el usuario no haya expresado explícitamente su
deseo de tenerlo en el momento de expedir el DNIe en comisaría.
Si detecta que Autofirma o cualquier otro software le permite ver el certificado de autenticación de
su DNIe y no el certificado de firma, acuda a comisaría para expresar su problema.
• Autofirma no puede comunicarse con el navegador en macOS
• Se solicita múltiples veces la contraseña del Llavero de macOS al firmar
• A partir de macOS Sequoia 15.2 se solicita al usuario varias veces la contraseña del llavero
de macOS cuando se desea firmar, indicando que se ha solicitado “exportar la llave” y
“acceder a la llave” del certificado. Este comportamiento es normal, la doble solicitud viene
determinada por la política de gestión de certificados de Apple y los mensajes que se
muestran no son correctos ya que la clave del certificado no se extrae del llavero.
Es posible marcar la opción “No volver a mostrar” del diálogo de selección de certificados para hacer
que no se vuelva a pedir la contraseña cuando Autofirma utilice ese certificado.
• Sólo se realiza la firma del primer documento de una serie cuando se realizan las firmas
desde Google Chrome
• No se abre la aplicación de firma al realizar la firma desde Google Chrome
• No se abre la aplicación de firma con Edge Legacy (EdgeHTML)
• No se abre la aplicación de firma con Firefox cuando el servidor declara una política de
seguridad (CSP)
A continuación, se describen los problemas asociados a estos casos de error.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
150
10.1 No se puede acceder al almacén de claves de Firefox 49.0 y superiores
Para el acceso al almacén de claves y certificados de Firefox 49 y superiores en Windows necesita se
que se tenga instalado el entorno de ejecución redistribuible de Microsoft Visual C++ 2015. Si no
consigue acceder a sus certificados y claves privadas desde Autofirma, necesitará descargar este
software e instalarlo manualmente.
El entorno de ejecución redistribuible de Microsoft Visual C++ 2015 puede descargarse desde:
• https://www.microsoft.com/en-us/download/details.aspx?id=53840
Una vez en el enlace, seleccione el idioma y la arquitectura adecuada para su sistema operativo.
El proceso de instalación puede requerir permisos de administrador.
10.2 No se puede acceder al almacén de claves de Firefox 58
El navegador web Firefox basa su almacén de claves y certificados en NSS y, concretamente, en
Firefox 58 se hace uso de NSS 3.34. Se han encontrado problemas de compatibilidad entre esta
versión de NSS y Java que impiden que Autofirma pueda acceder al almacén de certificados internos
del navegador. Este problema está relacionado con la forma en la que Firefox 58 genera los almacenes
de claves.
Un usuario que desee utilizar Firefox 58 puede, como solución parcial, instalarse una versión previa
de Firefox, por ejemplo, Firefox 56, instalar sus certificados en el almacén y, a continuación, actualizar
el navegador. Por defecto, el propio navegador se actualizará al reiniciarlo, así que los certificados
deben instalarse en el momento de abrirlo la primera vez.
Pueden descargarse versiones anteriores de Firefox desde:
https://ftp.mozilla.org/pub/firefox/releases/
10.3 No se detecta la inserción/extracción del DNIe en el lector (u otra
tarjeta inteligente)
A veces puede ocurrir que el navegador no detecta la extracción o introducción del DNIe (u otra
tarjeta inteligente) en el lector, por lo que, si no hemos introducido la tarjeta previamente a que se
arranque Autofirma, no se encontrará el certificado. Otro posible caso es que una vez cargado
Autofirma, se extraiga la tarjeta y, al realizar una operación de firma, el navegador muestre los
certificados de la tarjeta (aunque ya no esté presente) fallando al intentar utilizarlo.
Puede forzar a la recarga del almacén mediante el botón de actualizar del diálogo de selección de
certificados ( ). Si el cliente sigue sin detectar la tarjeta, pruebe a insertar la tarjeta antes de iniciar
la operación de firma.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
151
10.4 Falla la operación de firma con DNIe o una tarjeta de la FNMT
Se conoce de cierta incompatibilidad de Autofirma con los controladores de DNIe y las tarjetas de la
FNMT. Esta incompatibilidad puede llevar a que no se pueda firmar con estas tarjetas o que sólo se
pueda realizar una firma y falle el proceso cuando se intente hacer alguna más.
Para solventar este problema, Autofirma incorpora la biblioteca JMulticard, un controlador Java para
DNIe y algunas tarjetas de la FNMT.
Si se produce algún error al generar firmas con DNIe o tarjetas de la FNMT, abra Autofirma, acceda al
panel de “Preferencias”, pestaña “General” y verifique que en el panel “Opciones generales” se
encuentra activada la opción “Habilitar JMulticard para el uso de tarjetas de la FNMT y DNIe (requiere
reiniciar Autofirma)”.
Si sigue sin funcionar la operación de firma, es posible que Autofirma no sea compatible con su tarjeta
inteligente. En ese caso, asegúrese de que dispone de la última versión de los controladores de la
tarjeta.
10.5 No se permite la firma de PDF con ciertos certificados
Las firmas de documentos PDF realizadas externamente (que es el método utilizado por Autofirma)
tienen un tamaño máximo de octetos que pueden ocupar dentro del PDF.
Como la firma incluye la cadena de certificación completa, si esta es muy extensa puede llegar a
agotarse este espacio y resultar en una firma inválida o corrupta.
10.6 El servicio de firma trifásica genera un error al realizar firmas XAdES
en servidores JBoss
A partir de determinada versión del servidor de aplicaciones JBoss (7 / EAP 6), este incorpora de serie
diversas bibliotecas Java que entran en conflicto con la versión de estas mismas bibliotecas
incorporadas en el JRE/JDK de Oracle. A saber, las bibliotecas Xalan y Xerces de Apache. Esto deriva
en que durante el proceso de firma se produce un error de casting o similar, según sea la operación
y versión de JBoss. El error se produce a que la JVM da preferencia a las bibliotecas proporcionadas
por el servidor de aplicaciones frente a las suyas propias.
Frente a esto, se propone una sucesión de posibles soluciones de tal forma que si la primera de ellas
no es viable se intente la siguiente solución y así sucesivamente:
• Solución 1: Revisar la documentación del servidor de aplicaciones en cuestión para
comprobar si existe un mecanismo documentado para dar preferencias a las bibliotecas de
Java frente a las bibliotecas importadas por el propio servidor de aplicaciones.
• Solución 2: Otra opción, no tan eficiente como la anterior, aunque puede que más sencilla,
viene a ser identificar el fichero “rt.jar” de la JVM de nuestro servidor e introducirlo en el
directorio de bibliotecas del WAR del servicio de firma trifásico (directorio WEB-INF/lib). Al

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
152
igual que en el caso anterior, así conseguiremos que la JVM dé prioridad a la versión de
Xalan/Xerces que incorpora este JAR, los por defecto de Java, en lugar de a las bibliotecas del
servidor de aplicaciones.
• Solución 3: Si todo lo anterior fracasase, pero supiésemos que ninguna otra aplicación hace
uso de estas bibliotecas del servidor de aplicaciones, podríamos sustituirlas por la versión
1.4.6 de Xerces y sus dependencias. De esta forma, se podría ejecutar la operación de firma,
aunque varias funcionalidades de JBoss relacionadas con los despliegues seguros conforme a
la arquitectura definida por RedHat podrían verse afectados.
10.7 Las firmas con DNIe requieren que se introduzca el PIN del DNIe por
cada operación de firma
El DNIe y los controladores que le dan soporte están desarrollados conforme a diversas normativas
de seguridad, entre ellas, la norma europea EN14890. Esta norma define la necesidad de que el PIN
del DNIe se presente ante cada una de las operaciones de firma.
Autofirma incorpora la biblioteca JMulticard, un controlador Java que le permite utilizar el DNIe sin
necesidad de que se encuentre instalado el controlador oficial. Así mismo, permite activar o
desactivar este controlador que, por defecto, se encuentra activado.
Cuando se se utiliza JMulticard, el diálogo de inserción de PIN permitirá seleccionar la opción de
recordar la contraseña, pero esta sólo se recordará mientras Autofirma se encuentre cargado y no se
vuelva a pedir la selección de certificado. Si desea que la contraseña se recuerde durante varias
operaciones, utilice el método setStickySignatory() de AutoScript para dejar preseleccionado
el certificado después de seleccionarlo.
Cuando no se utilice JMulticard, la necesidad de volver a requerir el PIN de la tarjeta recaerá sobre el
propio controlador de DNIe, que podrá o no recordarlo entre operaciones.
Tenga en cuenta que la contrafirma de un documento con múltiples firmas puede implicar firmar
varias veces, aunque sólo se genere una única firma electrónica. Así pues, este tipo de firmas pueden
requerir que el usuario inserte varias veces el PIN de su DNIe.
Pueden consultar más información acerca del DNIe en el siguiente enlace:
http://www.dnielectronico.es/PortalDNIe/
10.8 No aparece el certificado de firma de un DNIe
El certificado de firma del DNIe es un certificado opcional que no se incluirá nunca en los DNIe de los
menores de edad y podría tampoco incluirse cuando el usuario no haya expresado explícitamente su
deseo de tenerlo en el momento de expedir el DNIe en comisaría.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
153
Si detecta que Autofirma o cualquier otro software le permite ver el certificado de autenticación de
su DNIe y no el certificado de firma, acuda a comisaría para expresar su problema.
10.9 Autofirma no puede comunicarse con el navegador en macOS
En algunos casos la instalación de Autofirma en macOS finaliza sin errores, pero no se instala el perfil
de seguridad que permiten que Autofirma se comunique de forma segura con el navegador web. En
estos casos, al realizar una operación de firma se arrancará correctamente Autofirma, pero este no
será capaz de transmitir el resultado de la firma al navegador web. Esto puede generar un error del
navegador con el texto “No se ha podido conectar con Autofirma.”.
Para solventar este problema será necesario configurar manualmente la confianza en los certificados
de Autofirma.
Para ello:
1. Acceda a la aplicación “Acceso a llavero”.
2. Acceda al llavero “SISTEMA” y a la opción “Certificados”.
3. En el listado de certificados mostrados deben aparecer los certificados “127.0.0.1” y
“Autofirma ROOT”. Si el icono que aparece junto a estos muestra el signo ‘+’, se confía en los
certificados y la comunicación con Autofirma debería funcionar correctamente. Si no,
continue con el proceso.
4. Haga clic sobre el certificado “127.0.0.1” y pulse en la opción “Confiar”.
5. En el diálogo que debe haber aparecido, despliegue el listado “Al utilizar este certificado” y
seleccione la opción “Confiar siempre”.
6. Repita los pasos 4 y 5 para el certificado “Autofirma ROOT”.
7. Compruebe que en ambos certificados aparece ahora el símbolo ‘+’ junto a su icono.
8. Cierre la ventana de los llaveros.
9. Introduzca la contraseña de su usuario en el diálogo para confirmar el cambio en la
configuración de seguridad.
10.10 Se solicita múltiples veces la contraseña del Llavero de macOS al
firmar
A partir de macOS Sequoia 15.2 se solicita al usuario varias veces la contraseña del llavero de macOS
cuando se desea firmar, indicando que se ha solicitado “exportar la llave” y “acceder a la llave” del
certificado. Este comportamiento es normal, la doble solicitud viene determinada por la política de
gestión de certificados de Apple y los mensajes que se muestran no son correctos ya que la clave del
certificado no se extrae del llavero.
Es posible marcar la opción “No volver a mostrar” del diálogo de selección de certificados para hacer
que no se vuelva a pedir la contraseña cuando Autofirma utilice ese certificado.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
154
10.11 Sólo se realiza la firma del primer documento de una serie cuando se
realizan las firmas desde Google Chrome
El navegador Google Chrome dispone de un mecanismo de seguridad en base al cual no permite
realizar más de una llamada a una URL externa ante una única interacción del usuario, como la
pulsación de un botón, por ejemplo. Esta limitación aplica a la llamada a Autofirma, tanto a Autofirma
en entornos de escritorio como a Autofirma App en entornos Android, por lo que sólo se podrá abrir
la aplicación una sóla vez ante una única operación del usuario.
La realización de firmas en serie con el cliente se debe realizar siempre invocando una operación de
firma una vez ha terminado la anterior (comúnmente desde las funciones callback que notifican el
final de una firma). En el caso por defecto de Autofirma esta limitación no afecta al usuario, ya que
sólo se invoca la aplicación la primera vez y se le solicitan firmar los distintos documentos a través de
un socket.
Sin embargo, la limitación impuesta por Google Chrome sí afecta a Autofirma cuando se fuerza que
la comunicación entre Autofirma y el navegador se realice mediante servidor intermedio (mediante
el uso de la sentencia “AutoScript.setForceWSMode(true)”) y afectará siempre al uso del
Autofirma App para Android. En estos casos, la aplicación se abrirá para procesar la primera firma de
la serie, pero se ignorarán las llamadas para procesar los siguientes documentos.
Cuando se deba realizar la firma de múltiples documentos simultáneamente, se recomienda aplicar
alguna de las siguientes directrices:
• Utilizar el modelo de firma de lotes de documentos.
• Nunca forzar la comunicación por servidor intermedio.
• Recomendar a los usuarios de Android el uso de un navegador distinto a Google Chrome.
Esta limitación está relacionada con la descrita en el problema 10.12 No se abre la aplicación de firma
al realizar la firma desde Google Chrome.
10.12 No se abre la aplicación de firma al realizar la firma desde Google
Chrome
El navegador Google Chrome dispone de un mecanismo de seguridad en base al cual no permite
realizar una llamada a una URL externa pasados unos pocos segundos entre la interacción del usuario
con la página, como la pulsación de un botón, y la propia llamada. Esta limitación aplica a la llamada
a Autofirma y Autofirma App para Android, por lo que la aplicación no se abrirá si transcurre
demasiado tiempo entre la solicitud de firma del usuario y la llamada a la aplicación.
Esto no debe afectar al uso de Autofirma desde Chrome ya que, por defecto, la llamada a la aplicación
se realiza de forma inmediata y los datos se transmiten a través de un socket.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
155
Sin embargo, la limitación impuesta por Google Chrome sí puede afectar Autofirma cuando se fuerza
que la comunicación entre Autofirma y navegador se realice mediante servidor intermedio (mediante
el uso de la sentencia “AutoScript.setForceWSMode(true)”) y en cualquier caso al uso de
Autofirma App para Android. En estos casos, si los datos no pueden enviarse a través de la URL de
invocación a la aplicación, deberán subirse primeramente al servidor intermedio para que después la
aplicación de firma los descague. Cuando esta subida de los datos dure más de unos pocos segundos,
la aplicación de firma no se abrirá.
Por regla general, para evitar los problemas derivados de esta restricción de navegador Chrome, se
deberían seguir las siguientes sugerencias:
• Utilizar el modelo de firma trifásica con un DocumentManager a medida (no con el por
defecto), para que los datos a transmitir entre el navegador y la aplicación sean siempre
pequeños.
• Nunca forzar la comunicación por servidor intermedio.
• Recomendar a los usuarios de Android el uso de un navegador distinto a Google Chrome.
Esta limitación está relacionada con la descrita en el apartado 10.10 Se solicita múltiples veces la
contraseña del Llavero de macOS al firmar
A partir de macOS Sequoia 15.2 se solicita al usuario varias veces la contraseña del llavero de macOS
cuando se desea firmar, indicando que se ha solicitado “exportar la llave” y “acceder a la llave” del
certificado. Este comportamiento es normal, la doble solicitud viene determinada por la política de
gestión de certificados de Apple y los mensajes que se muestran no son correctos ya que la clave del
certificado no se extrae del llavero.
Es posible marcar la opción “No volver a mostrar” del diálogo de selección de certificados para hacer
que no se vuelva a pedir la contraseña cuando Autofirma utilice ese certificado.
Sólo se realiza la firma del primer documento de una serie cuando se realizan las firmas desde Google
Chrome.
10.13 No se abre la aplicación de firma con Edge Legacy (EdgeHTML)
Advertencia: Autofirma ya no da soporte oficialmente a Microsoft Edge Legacy.
Existen determinada configuración de Microsoft Edge Legacy que impide el uso de sockets, lo que
lleva a que la aplicación no se pueda comunicar con AutoScript y este termine dando un error pasado
un tiempo de espera.
Este error se puede identificar cuando al inciar la operación se muestra la imagen de inicio de
Autofirma (splash) pero nunca se llega a mostrar la aplicación. Además, en la consola de Edge aparece
recurrentemente un error con el mensaje:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
156
SCRIPT12029: SCRIPT12029: WebSocket Error: Network Error 12029, No se pudo
establecer una conexión con el servidor
Este problema se debe a que el navegador está aplicando ciertas restricciones a la aplicación
considerando que se trata de un servidor externo. Esto se produce cuando se encuentra en Windows
habilitada la opción de considerar parte de la intranet los sitios a los que no se acceda a través de un
servidor proxy. Puede ver esta opción a través del panel “Opciones de Internet” del sistema operativo,
pestaña “Seguridad”, al pulsar en la zona “Intranet” y seguidamente en el botón “Sitios”.
Es probable que esta opción se encuentre habilitada como parte de una configuración de maqueta
corporativa. Si es así, NO deshabilite esta opción, ya que podría afectar negativamente a la seguridad
de su equipo o el funcionamiento de aplicaciones coorporativas. Con esta opción habilitada no podrá
utilizar Autofirma con Edge Legacy. Si es posible, actualice a Edge Chromium o utilice otro navegador
web.
10.14 No se abre la aplicación de firma con Firefox cuando el servidor
declara una política de seguridad (CSP)
Mozilla Firefox no abre por defecto las URL con esquemas personalizados cuando el servidor web
declara una política de seguridad. Para permitir las llamadas con protocolo “afirma” utilizadas por
Autofirma, será necesario agregar a la política de seguridad el esquema correspondiente. Consulte el
apartado 5.4 Configuración del Content Security Policy para más información.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
157
### ANEXO I. ### Comunicación AutoScript - Autofirma
El JavaScript de despliegue AutoScript es el que incluye la lógica de comunicación entre el navegador
Web y Autofirma. Algunas de las operaciones solicitadas a través de AutoScript serán directamente
procesadas por él, mientras que otras sí requerirán que traslade la solicitud a Autofirma.
A pesar de que es AutoScript el que gestiona la delegación de tareas en la aplicación nativa
correspondiente a cada entorno, deben cumplirse una serie de requisitos para que esto sea posible.
Autofirma es una herramienta nativa que puede instalarse en Windows, Linux y macOS como
herramienta independiente de firma de datos locales. Sin embargo, al instalarse en el sistema
también registran el protocolo “afirma“, mediante lo cual atienden a las llamadas realizadas a este
protocolo. La llamada por protocolo es un mecanismo de invocación de aplicaciones (si acaso la
propia aplicación que realiza la llamada no puede atender a este protocolo) mediante el que puede
pasarse una cantidad limitada de información a modo de parámetros. Sin embargo, este protocolo
sólo permite la comunicación en un sentido ya que la aplicación invocada no puede hacer referencia
a la instancia de aquella que la invocó.
Es por esto por lo que, para permitir la comunicación bidireccional, Autofirma establece 2
mecanismos distintos:
• La comunicación mediante socket.
o Este sistema se utiliza cuando se ejecuta la operación en un equipo sobremesa y
navegador Chrome, Firefox, Safari, Internet Explorer 11 y Edge.
• La comunicación mediante un servidor intermedio.
o Este sistema requiere el despliegue de los dos servicios auxiliares de comunicación y
puede utilizarse potencialmente en cualquier navegador. Consulte el apartado
Servicios para más información.
o Dado que este sistema ofrece un peor rendimiento, por defecto sólo se utiliza en
entornos de usuario que no soportan la comunicación por sockets o en los que puede
dar problemas: dispositivos móviles, Internet Explorer 10 e inferiores, Safari 10….
Por regla general, siempre se deberían desplegar los servicios auxiliares para la comunicación por
servidor intermedio, ya que hay entornos que dependen de esos servicios, incluso si no son los más
utilizados.
I.1. Comunicación por sockets
En la comunicación por socket, Autofirma abre un socket local SSL y AutoScript traslada las peticiones
de la aplicación a través del él. Las respuestas se obtienen a través del propio socket.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
158
La arquitectura de comunicación seguida en este proceso se describe a continuación:
Primeramente, el trámite ordena la operación en cuestión por medio de AutoScript, por ejemplo, una
operación de firma. A continuación, el JavaScript detectará que el entorno del usuario soporta la
comunicación por sockets y lanzará Autofirma mediante una invocación por protocolo junto con las
instrucciones para abrirlo. Autofirma abrirá este socket cifrando el canal mediante un certificado SSL
y el JavaScript podrá enviar la orden de firma a través del este.
Una vez abierta la aplicación, cualquier petición posterior se realizará a través del mismo socket, sin
necesidad de relanzarla. Autofirma se cerrará al detectar que el puerto se ha cerrado o, si no es
posible detectarlo, cuando pase un tiempo sin haber recibido más peticiones desde el JavaScript.
La comunicación a través del socket se cifra mediante el protocolo TLS v1.1/v1.2. Es necesario tener
habilitados estos protocolos en el navegador para poder establecer la comunicación con Autofirma.
I.2. Comunicación por servidor intermedio
Este modo de comunicación se basa en dos servicios disponibles en el mismo dominio que el trámite
Web en el que se va a firmar. Cuando AutoScript y Autofirma necesiten comunicarse, uno subirá la
información que quiera transmitir a un servidor, de donde la otra parte lo descargará.
La comunicación por servidor intermedio es la utilizada por defecto cuando se accede a la página
desde un dispositivo móvil (en el que no se puede abrir un socket local) y cuando se accede desde
otro entorno con un navegador no compatible con la comunicación por sockets o en el que se han
encontrado problemas.
La arquitectura de comunicación seguida en este proceso se describe a continuación:
Firma
Página Web autoscript.js Autofirma
firmar(datos)
Firma
firmar(datos)
Invocación por
protocolo
Socket

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
159
Cuando AutoScript deba enviar a la aplicación de firma la ejecución de una operación, subirá los datos
que deba enviarle al servidor intermedio por medio del servicio de guardado, invocará a la aplicación
de firma mediante una llamada por protocolo y ésta se descargará los datos por medio del servicio
de recuperación. Una vez procesados los datos, la aplicación almacenará el resultado en el servidor
intermedio y AutoScript descargará estos datos del servidor para obtener el resultado final.
En este modo de comunicación, AutoScript abre ejecuta Autofirma por cada operación. Después de
finalizar una operación, la aplicación se cierra o queda en segundo plano.
Consulte el apartado 5.3.1 Servicios auxiliares de comunicación para saber más de estos servicios de
Autofirma y cómo desplegarlos.
Página Web
firmar(datos)
Firma
Invocación por
protocolo
autoscript.js Autofirma
Datos a
firmar Firma
generada
Firma
generada
Servidor
intermedio

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
160
### ANEXO II. ### Firma trifásica
Una firma electrónica se compone de los siguientes pasos:
1. Construir la estructura que el usuario debe firmar según el formato de firma y la configuración
seleccionada.
2. Realizar la firma digital de esos datos con el certificado del usuario.
3. Introducir la firma digital en la estructura de firma.
En el comportamiento por defecto, Autofirma realizaría todos estos pasos consecutivamente. Sin
embargo, el proceso puede realizarse en tres fases separadas, en donde la primera y la tercera fase,
que son las que no requieren la clave privada de firma, se realicen en un servidor remoto, mientras
que la segunda seguiría realizándose en el equipo cliente. Este proceso de firma dividido en 3 fases
es lo que se denomina firma trifásica.
Esta operativa resulta de mucho interés en determinados casos:
• El origen y/o el destino de la información es un servidor, de tal forma que se pueden pre-
procesar los datos en servidor (Fase I) y mandar al usuario sólo la información mínima
necesaria; el usuario la firmaría en su sistema (Fase II) y el resultado se enviaría de vuelva a
servidor; en donde se compondría la firma (Fase III) y podría postprocesarse y almacenarse.
• Se necesita firmar documentos muy grandes. La firma trifásica interesa en este caso porque
la mayor carga de proceso recaería sobre el servidor y no sobre el sistema del usuario que
presuntamente tendrá menos recursos.
El uso de la firma trifásica en estos casos conlleva una serie de ventajas y desventajas:
• Ventajas
o El documento no viaja a través de la red.
o Mayor facilidad para desarrollos sobre dispositivos móviles y similares, ya que no es
necesario programar la lógica del formato para el dispositivo, sólo es necesaria la fase
del cifrado de los datos con la clave del usuario.
o Menos propenso a errores debido a que la parte cliente no se vería expuesta a las
muchas variables del entorno que pueden afectar a los distintos formatos de firma
(versiones preinstaladas de bibliotecas, cambios en Java, …). Las operaciones más
complejas se realizan en servidor, un entorno mucho más controlado.
• Desventajas:
o Implica un mayor número de conexiones de red, aunque el tráfico de red, según el
caso, podría sea menor.
o Requiere el despliegue de un servicio en el servidor que se encargue de realizar las
fases 1 y 3.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
161
Debe recalcarse que el procedimiento de firma trifásica es útil cuando los datos a firmar residen en
servidor y la firma generada se necesita también en servidor. En estos casos, se podría indicar al
servidor de donde obtener los datos a firmar y qué hacer con la firma generada. Si los datos y/o la
firma deben estar en cliente, no solo se produce un innecesario tráfico de red, sino que se aumenta
la posibilidad de fallo y se incrementan las necesidades de memoria del cliente de firma.
El proceso de firma de lotes de Autofirma realiza siempre firmas trifásicas, ya que en un escenario en
el que se deben cargar múltiples datos y se generan múltiples firmas se puede volver inviable el
conservar en memoria toda la información, además del hecho de que probablemente haya que
descargarla y luego subirla de nuevo al servidor. Cuando se hable de un proceso de firma de lotes se
debe entender que se usarán firmas trifásicas, sólo que se hará uso de los servicios de prefirma y
postfirma de lotes en lugar del servicio de firma trifásica tradicional. Por lo demás, todas las
consideraciones de firma trifásica afectan de igual manera al proceso de firma de lotes.
II.1. Servicios de firma trifásica y de lotes
Los servicios de firma trifásica y de lotes realizan en servidor la primera y tercera fase del proceso de
firma. Junto a Autofirma se distribuye el archivo WAR “afirma-server-triphase-signer.war”
que despliega los servicios con las funcionalidades de firma trifásica. Estoa servicios no es
dependientes de ningún servidor de aplicaciones concreto. Consulte el manual de su servidor de
aplicaciones para saber cómo desplegar este fichero WAR y el apartado 5.3.2 Servicios de firma
trifásica y firma de lotes para saber como configurar los servicios.
Estos servicios soportan la generación de firmas en formato CAdES, XAdES, PAdES y FacturaE y
admiten las mismas opciones de configuración que las firmas monofásicas de estos formatos.
Desplegar y configurar estos servicios es necesario para la generación expresa de firmas trifásicas, el
uso de la operativa de firma de lotes, en la que todas las firmas se generan de forma trifásica. También
puede ser necesario para el uso de Autofirma App, ya que este delega en el servicio trifásico la
generación de las firmas en los formatos que no soportan nativamente. Para saber más acerca de
Autofirma App, consulte el apartado 9 Compatibilidad con dispositivos móviles.
II.1.1. Gestor de documentos del servicio
La principal ventaja del proceso de firma trifásica es que no es necesario descargar a la página web
los datos a firmar para luego pasárselos al método de firma, ni será necesario recoger la firma en un
método callback para luego enviarla al servidor. Los datos pueden cargarse directamente en servidor,
no es necesario que viajen al equipo del usuario, y la firma puede guardarse directamente, sin
necesidad de que la recoja nuestra aplicación. Esta lógica de cargar los datos y guardar la firma la
gestiona el servicio de firma trifásica por medio de lo que llamaremos “gestor de documentos”
(Document Manager).

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
162
Nuestro servicio de firma trifásica tendrá configurado un gestor de documentos que le dirá cómo
obtener los datos y guardar las firmas. Este gestor de documentos se configura a través de la
propiedad “document.manager” del fichero de configuración del servicio. Este gestor se utilizará
tanto para las operaciones de firma trifásica individuales como para las operaciones de firma de lotes.
Un desarrollador puede crear un gestor de documentos optimizado para el proceso en el que se va a
utilizar, pero el servicio de firma trifásica se distribuye con varios gestores de documento ya
integrados:
• es.gob.afirma.triphase.server.document.SelfishDocumentManager
o Es el Document Manager por defecto y emula el comportamiento de la firma
monofásica de Autofirma.
o Si no tenemos interés en la firma trifásica, pero sí queremos que nuestra aplicación
sea compatible con la operación de firma de Autofirma App, deberemos desplegar el
servicio de firma trifásica con este gestor de documentos configurado. Este servicio
permitirá completar la firma cuando se utilice un formato no soportado por la
aplicación móvil en cuestión:
▪ Autofirma App para Android:
• XAdES y FacturaE.
▪ Autofirma App iOS:
• XAdES, FacturaE y PAdES.
o Nota: Este gestor de documentos carece de valor en las operaciones de firma de
lotes, ya que no hace nada con las firmas y estas se pierden.
o Recibe:
▪ Los datos para firmar.
o Devuelve:
▪ La firma generada.
• es.gob.afirma.triphase.server.document.FileSystemDocumentManager
o Permite cargar los datos a firmar desde un directorio de entrada y guarda las firmas
resultantes en un directorio de salida.
o Recibe:
▪ El nombre del fichero de datos a firmar.
o Devuelve:
▪ El nombre con el que se ha guardado el fichero de firma.
o Si se configura este Document Manager, se pueden configurar otras cuatro
propiedades en el fichero de configuración del servicio:
▪ docmanager.filesystem.indir: Directorio del servidor en donde se
encuentran los documentos de datos.
▪ docmanager.filesystem.outdir: Directorio del servidor en donde se
almacenan las firmas generadas.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
163
▪ docmanager.filesystem.overwrite: Configura si se deben sobrescribir
los ficheros de firma si ya existe una con el mismo nombre (true) o no
(false).
▪ docmanager.filesystem.maxDocSize: Permite limitar a un tamaño
máximo los ficheros que se quieren firmar. El tamaño se indicará en bytes. Si
el fichero supera este tamaño, no se firmará.
o Advertencia: La inclusión del FileSystemDocumentManager busca servir como
ejemplo de gestor de documentos. Este gestor no debería usarse salvo que se ajuste
muy concretamente a sus necesidades. Si no es así, lo correcto es que implemente
su propio gestor de documentos optimizado para la carga y el guardado de
documentos en sus sistemas.
o Consulte el apartado II.2.1 Gestor de documentos
“FileSystemDocumentManager” para obtener información sobre cómo integrar
el uso de este gestor de documentos en su aplicación.
• es.gob.afirma.triphase.server.document.LegacyBatchDocumentManager
o Permite mantener la compatibilidad con los SaveSigner del antiguo mecanismo de
lotes. Este gestor no se debería utilizar más que para esta finalidad. Permite los dos
mecanismos de entrada que permitía el antiguo sistema de firmas (datos en Base64
o URL), y es compatible con los SignSaver que existían por defecto y cualquier otro
agregado a posteriori.
o Recibe:
▪ Los datos coficiados en Base 64 o una URL a los mismos.
o Devuelve:
▪ La cadena “OK”.
o Si se configura este Document Manager, también se puede configurar las siguientes
propiedades en el fichero de configuración del servicio:
▪ docmanager.legacybatch.allowedsources: Fuentes de datos de
entrada admitidos. Deberá indicar las distintas fuentes de datos separadas
por punto y coma (‘;’). Los valores admitidos son:
• base64: Datos de entrada en Base 64.
• file:/: URL de un fichero de datos en servidor. Se puede completar
con la parte de la ruta que se desee y terminar con asterisco (‘*’)
para determinar cualquier fichero en esa ruta. (No se recomienda el
uso de este esquema)
• http://: URL con esquema HTTP para el acceso remoto a los datos.
Se puede completar con la parte de la ruta que se desee y terminar
con asterisco (‘*’) para determinar cualquier origen en esa ruta.
• https://: URL con esquema HTTPS para el acceso remoto a los
datos. Se puede completar con la parte de la ruta que se desee y

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
164
terminar con asterisco (‘*’) para determinar cualquier origen en esa
ruta.
• ftp://: URL para el acceso remoto a los datos en un FTP. Se puede
completar con la parte de la ruta que se desee y terminar con
asterisco (‘*’) para determinar cualquier origen en esa ruta.
Por ejemplo:
• base64;https://www.midominio.com/datos/*
o Admite datos en base 64 y datos proporcionados a través de
una dirección HTTPS determinada.
▪ docmanager.legacybatch.checksslcerts: Indica si se debe
comprobar la confianza en el certificado SSL de las fuentes de datos en los
que se encuentre el canal cifrado. Si se establece con valor true, se realizará
la comprobación y se se establece a false, no.
▪ docmanager.legacybatch.maxDocSize: Permite limitar a un tamaño
máximo los ficheros que se quieren firmar. El tamaño se indicará en bytes. Si
el fichero supera este tamaño, no se firmará.
o Consulte el apartado II.2.2 Gestor de documentos
“LegacyBatchDocumentManager” para obtener información sobre cómo integrar
el uso de este gestor de documentos en su aplicación.
Un desarrollador Java podría crear nuevos gestores de documentos e integrarlos en el servicio. Esto
le permitiría crear procesos óptimos que accediesen a sus entornos para recoger los datos y guardar
las firmas y así se evitase la descarga de los datos redujese la transferencia de datos entre el cliente
de firma y los servidores del por red.
II.1.2. Gestores de documentos personalizados
II.1.2.1. Desarrollo de un gestor de documentos personalizado
Sólo el responsable de un entorno conoce los requisitos de acceso al mismo, el proceso adecuado
para acceder y las medidas de seguridad que es necesario implementar. Es por esto por lo que el
servicio trifásico permite que los integradores desarrollen su propia clase gestora de documentos y
configurar en el servicio de firma trifásica el que se utilice esta. Por ejemplo, si los documentos a
firmar se almacenasen en un repositorio de contenidos remoto y las firmas se deben guardar en base
de datos, podremos implementar la lógica de nuestra clase gestora de documentos para que acceda
a estos entornos usando las credenciales adecuadas, recupere los documentos y almacene las firmas.
Para implementar un gestor de documentos, se deberá implementar la interfaz
es.gob.afirma.triphase.server.DocumentManager o
es.gob.afirma.triphase.server.BatchDocumentManager (que hereda de la anterior),

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
165
disponibles en el módulo “afirma-server-triphase-signer-document” del proyecto. Si se desea,
se puede importar a su proyecto mediante la siguiente referencia de Maven:
<dependency>
<groupId>es.gob.afirma</groupId>
<artifactId>afirma-server-triphase-signer-document</artifactId>
<version>1.8.0</version>
</dependency>
La interfaz DocumentManager define los siguientes métodos que deberemos implementar:
• byte[] getDocument(String dataRef, X509Certificate[] certChain,
Properties prop) throws IOException;
o Método para la obtención del documento que se desea firmar.
o Los parámetros recibidos en este método serán:
▪ dataRef: Referencia a los datos que se deben firmar. Esta cadena es la que
se introduce en el método de firma o agregar documento a un lote.
▪ certChain: Cadena de certificación del certificado utilizado para firmar.
Según el tipo de operación, la aplicación utilizada y el almacén del usuario,
es posible que este valor sólo contenga el certificado de firma o incluso que
el parámetro sea nulo.
▪ prop: Parámetros para la configuración de firma. Este es parámetro
extraParams proporcionado en el método de firma de Autofirma o el de
agregar documento al lote. Se podrían incluir aquí parámetros que no entren
en conflicto con los de firma y que nos sirvan para proporcionar mayor
información a la clase gestora de documentos.
o Esta función debe devolver el binario del documento a firmar.
o En caso de producirse un error al recuperar el documento, la clase gestora deberá
lanzar una excepción de tipo IOException.
• String storeDocument(String dataRef, X509Certificate[] certChain,
byte[] data, Properties prop) throws IOException;
o Método para el tratamiento y guardado de la firma generada.
o Además del guardado, en este método se podrían implementar funciones adicionales
de las que se quiera liberar a las distintas aplicaciones que hagan uso del gestor. Por
ejemplo, se podría implementar aquí el proceso de validación de la firma o la
agregación de un sello de tiempo (agregar un un sello de tiempo con @firma lleva
implícito el validar la firma). De esta forma, si fallase este proceso, Autofirma
nortificaría al usuario de forma inmediata.
o Los parámetros recibidos en este método serán:
▪ dataRef: Identificador de los datos que se firmaron. Es el mismo valor que
se debió recibir en el método getDocument.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
166
▪ certChain: Cadena de certificación del certificado utilizado para firmar.
Según el tipo de operación, la aplicación utilizada y el almacén del usuario,
es posible que este valor sólo contenga el certificado de firma o incluso que
el parámetro sea nulo.
▪ data: Firma electrónica generada. Son los datos que se deberán tratar y
guardar.
▪ prop: Parámetros para la configuración de firma. Este es parámetro
extraParams proporcionado en el método de firma de Autofirma o el de
agregar documento al lote. Se podrían incluir aquí parámetros que no entren
en conflicto con los de firma y que nos sirvan para proporcionar mayor
información a la clase gestora de documentos.
o Este método debe devolver una cadena en Base 64, que será la que se reciba como
parámetro de datos en el método de éxito de firma de la aplicación que invocó a
Autofirma. Esta cadena no tiene que ser un dato significativo si no es necesario. Por
ejemplo, podría limitarse a devolver la cadena “OK” (codificada en base 64),
únicamente para que la aplicación sepa que ha finalizado correctamente. Este valor
de retorno no se devuelve a la aplicación cuando se ha realizado una firma de lote.
En este caso, se obtiene una estructura JSON con el estado en el que ha terminado
cada una de las firmas del lote.
o En caso de producirse un error al tratar y guardar el documento, la clase gestora
deberá lanzar una excepción de tipo IOException.
Por su parte, la interfaz BatchDocumentManager declara los siguientes métodos adicionales:
• void rollback(String dataRef, X509Certificate[] certChain, Properties
prop) throws IOException
o Este método revierte el proceso de guardado de una firma mediante el método
storeDocument. Este método se utilizaría si se produjese un fallo en el guardado
de un documento del lote y la aplicación hubiese indicado que se desea detener el
proceso en caso de error, ya que se debía guardar todo o nada.
o Los parámetros recibidos en este método son los mismos usados en el de guardado:
▪ dataRef: Referencia a los datos firmados. Esta cadena es la que se
introduce en el método de firma o agregar documento a un lote.
▪ certChain: Cadena de certificación del certificado utilizado para firmar.
Según el tipo de operación, la aplicación utilizada y el almacén del usuario,
es posible que este valor sólo contenga el certificado de firma o incluso que
el parámetro sea nulo.
▪ config: Parámetros para la configuración de firma. Este es parámetro
extraParams proporcionado en el método de firma de Autofirma o el de
agregar documento al lote. Se podrían incluir aquí parámetros que no entren
en conflicto con los de firma y que nos sirvan para proporcionar mayor
información a la clase gestora de documentos.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
167
o En caso de producirse un error al revertir el guardado, se deberá lanzar una excepción
de tipo IOException.
• void init (Properties config)
o Este método inicializa el gestor con los parámetros de configuración establecidos en
el fichero de configuración del servidor trifásico (“tps_config.properties”). Esto
permite configurar el comportamiento del gestor por medio de este fichero.
Si no se implementa la interfaz BatchDocumentManager, pero aún se quiere poder configurar el
gestor con las propiedades del fichero de configuración del servicio, se puede implementar en la clase
gestora un constructor que reciba un objeto Properties. El servicio de firma trifásica hará uso de
este constructor para inicializar la clase y le proporcionará a través de este parámetro todas las
propiedades del fichero de configuración. Si se implementa la interfaz BatchDocumentmanager,
siempre se utilizará el constructor vacío y el método init de la clase.
Una clase que herede de DocumentManager también se puede usar como gestor de documentos en
las operaciones de firma de lote, pero al no tener definido esta interfaz el método rollback, el uso
con el parámetro stopOnError de la firma de lotes estaría desaconsejado, ya que no se desharían
los guardados que se hiciesen.
II.1.2.2. Configuración de un gestor de documentos personalizado
Para configurar una clase gestora de documentos personalizada se deberá incluir esta como parte del
servicio de firma trifásica. Esto se puede hacer generando una JAR con las clases y recursos necesarios
del conector e incluyéndola dentro del WAR del servicio de firma trifásica. Para esto, se debe abrir el
WAR “afirma-server-triphase-signer.war” con una aplicación de compresión de ficheros y
agregar el JAR en el subdirectorio “\WEB-INF\lib\”. Esta versión modificada del WAR es la que se
deberá desplegar en lugar del WAR por proporcionado.
Seguidamente, se deberán establecer en el fichero de configuración del servicio
(“tps_config.properties”) la propiedad “document.manager” con el nombre completo de
nuestra clase gestora de documentos y todas aquellas propiedades adicionales que quieran tomar de
este fichero. Puede consultar más información sobre este fichero en el apartado 5.3.2.1 Configuración
del servicio trifásico.
Si la recuperación de los documentos del gestor de documentos puede cosiderarse una tarea pesada,
puede valorarse activar la caché del servicio de firma trifásica. Consulte más acerca de esta propiedad
en el apartado 5.3.2.1 Configuración del servicio trifásico.
II.2. Uso de la firma trifásica con los gestores de documentos
En este apartado se describe cómo deben utilizarse las operaciones de firma trifásica y de lotes con
cada uno de los gestores de documentos incluidos por defecto en el servicio.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
168
II.2.1. Gestor de documentos “FileSystemDocumentManager”
II.2.1.1. Parámetros de uso y descripción del funcionamiento
La clase gestora de documentos FileSystemDocumentManager permite gestionar la firma de ficheros
almacenados en servidor. Esta clase utiliza como identificador de documento el nombre de fichero,
tanto en la entrada (fichero a firmar) como en la salida (fichero de firma).
Esta clase gestora está preparada para recibir el nombre de los ficheros codificados en Base 64. Por
ejemplo:
• El documento “documento.pdf” se indicaría con la cadena “ZG9jdW1lbnRvLnBkZg==”.
• El documento “firma.xsig” se indicaría con la cadena “ZmlybWEueHNpZw==”.
El resultado depende del tipo de operación. En la función callback de éxito de la operación de firma
se proporcionará el nombre del fichero codificado en Base64. En la función callback de éxito de la
firma del lote, se proporcionará únicamente el JSON con el resultado de la operación del lote,
independientemente de la clase gestora de documentos empleada.
Es importante tener en cuenta que los nombres de fichero utilizados deben cumplir las restricciones
del sistema de ficheros donde se almacenen los documentos. Así, por ejemplo, en un sistema de
ficheros NTFS no deberíamos indicar nunca un nombre de ficheros que contuviese el carácter dos
puntos (“:”).
Por ejemplo, si quisiéramos realizar una firma trifásica con Autofirma y nuestro servicio de firma
trifásica tuviese configurado el gestor de documentos FileSystemDocumentManager podríamos
firmar así:
…
var params = "expPolicy=FirmaAGE\nserverUrl=https://miweb.com/afirma-server-
triphase-signer/SignatureService ";
// Queremos firmar el documento "12345678.pdf" del directorio de entrada
AutoScript.sign (AutoScript.getBase64FromText("12345678.pdf"),
"SHA512",
"PAdEStri",
params,
successCallback,
errorCallback);
…
function successCallback(filenameB64, certB64) {
// filenameB64 es el nombre del fichero de firma codificado en Base 64
}
En una operación de firma de lote, se usaría de la siguiente manera:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
169
…
// Creamos el lote
AutoScript.createBatch("SHA512", "PAdES", "sign", null);
// Agregamos los documentos que queramos al lote
AutoScript.addDocumentToBatch("1",
AutoScript.getBase64FromText("12345678.pdf"));
…
// Iniciamos la firma
var baseUrl = " https://miweb.com/afirma-server-triphase-signer/"
AutoScript.signBatchProcess (false,
baseUrl + "presign",
baseUrl + "postsign",
null,
successCallback,
errorCallback);
…
function successCallback(jsonResult, certB64) {
// jsonResult estructura JSON con el resultado de cada
// operación de firma del lote
}
Advertencia: Este gestor de documentos se incluye a modo ilustrativo. Si se desea utilizar en un
entorno productivo, es necesario tener en cuenta algunos requisitos de seguridad. Por ejemplo, los
documentos sólo deberían almacenarse en el directorio de entrada del servidor en el que se vaya a
iniciar el proceso de firma y debería eliminarse del mismo una vez finalizada. De otra forma, este
documento podría ser recuperado por una aplicación malintencionada mediante llamadas al servicio
trifásico. Las firmas en el directorio de salida también se deberían retirar una vez generadas.
II.2.1.2. Configuración en alta disponibilidad con varios nodos
Los directorios configurados para el uso de este gestor deben ser siempre directorios visibles y
compartidos por todas las instancias en ejecución.
Este aspecto es especialmente importante en configuraciones de servidores de aplicaciones en alta
disponibilidad, donde puede haber varios nodos que presten el servicio trifásico, cada uno de ellos
en un sistema de ficheros diferente. En este entorno, si se especifica una ruta local, puede ocurrir que
esta ruta apunte a un directorio distinto en cada nodo (distinto servidor, disco diferente, otro sistema
de ficheros, etc.).
El que todos los nodos accedan al mismo directorio referenciado en la configuración se puede lograr
usando un almacenamiento compartido entre todos ellos (con el mismo punto de montaje), mediante
enlaces simbólicos, etc. Es importante también asegurarse de que todos los nodos tienen los
permisos adecuados sobre los directorios configurados.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
170
II.2.2. Gestor de documentos “LegacyBatchDocumentManager”
El gestor de documentos LegacyBatchDocumentManager permite emular el funcionamiento del
antiguo mecanismo de firma de lotes, facilitando así la migración al mecanismo descrito en el
apartado 6.5 Firma de lotes predefinidos. Este gestor permite reutilizar los modos de referenciación
de documentos y los SignSaver que se usaban con el mecanismo anterior. Sin embargo, este gestor
sólo se debería utilizar cuando no se puede abordar el desarrollo de un DocumentManager que
implemente las funciones que se necesiten, ya que este gestor es un mero intermediario para
comunicar un sistema con otro.
Tenga en cuenta que, a pesar de emular el funcionamiento antiguo, la configuración de este gestor
de documentos debe encontrarse en el fichero “tps_config.properties”. El antiguo fichero
“signbatch_config.properties” sólo es necesario si se utiliza el antiguo mecanismo de firma de
lotes.
II.2.2.1. Parámetros de uso y descripción del funcionamiento
Este gestor de documentos admite varias fuentes de datos:
• Permite recibir los datos directamente codificados en Base 64.
• Permite recibir una URL para el acceso a los datos (HTTP, HTTPS, FTP o FILE).
Por ejemplo, referencias válidas que se pueden utilizar son:
• wqFIb2xhIE11bmRvIQ==
o Firma la cadena “¡Hola Mundo!”, que se obtiene al decodificar este Base 64.
• https://servidor.es/aplicacion/datos/prueba.txt
o Firma el contenido del fichero prueba.txt obtenido al descargarlo a través de la URL.
• file://C:/datos/prueba.txt
o Firma el contenido del fichero prueba.txt cargado desde disco.
En el fichero de configuración “tps_config.properties” se puede configurar la propiedad
“docmanager.legacybatch.allowedsources” para establecer qué protocolos se pueden usar para
el acceso a los datos y si se permite indicar los datos en Base 64 o no. Consulte el apartado 5.3.2.1
Configuración del servicio trifásico para conocer el listado completo de opciones de configuración.
El procesado y guardado de la firma lo realiza este gestor de documentos a través de los SignSaver
que se utilizaban en el antiguo mecanismo de firma de lotes. Para seleccionar y configurar el
SignSaver, se deberán proporcionar una serie de propiedades de configuración a través del
parámetro extraParams del método de creación del lote o, si varía la configuración para cada uno
de los documentos, a través del extraParam del método de agregar documentos al lote.
El SignSaver a utilizar se configurará por medio de la propiedad “signSaver”. Con esta propiedad
el administrador podrá configurar que clase de guardado se utilizará. Esta puede ser una agregada
por el al servicio o una de las que se encuentran ya integradas. Las clases integradas son:

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
171
• es.gob.afirma.signers.batch.SignSaverFile
o Clase para el guardado de la firma en disco en el servidor.
o Esta clase admite además la siguiente propiedad para su configuración:
▪ FileName
• Establece la ruta de guardado de la firma.
• es.gob.afirma.signers.batch.SignSaverHttpPost
o Clase para el envío de la firma a un servidor remoto.
o Esta clase admite además las siguientes propiedades para su configuración:
▪ PostUrl
• Configura la URL del servicio de guardado.
▪ PostParamName
• Nombre del parámetro en el que se agregará la firma.
Un ejemplo de llamada al método de agregar a documentos al lote cuando se encuentre este gestor
de documentos configurado podría ser:
var ref1 = Base64.encode("Hola Mundo!!");
var params1 =
"mode=implicit\nsignSaver=es.gob.afirma.signers.batch.SignSaverFile\nFileName=C
:/Users/miusuario/firmas/firma1.csig";
AutoScript.addDocumentToBatch("1", ref1, "CAdES", "sign", params1);
var ref2 = "https://www.google.es";
var params2 = "format=XAdES
Detached\nsignSaver=es.gob.afirma.signers.batch.SignSaverFile\nFileName=C:/User
s/miusuario/firmas/firma2.xsig";
AutoScript.addDocumentToBatch("2", ref2, "XAdES", "sign", params2);
Si ya disponía de una clase SignSaver propia, podrá seguir utilizándola a través de esta clase gestora
de documentos. Para ello, configure a través del parámetro de configuración la propiedad
“signSaver” con el nombre completo de su clase y agregue al mismo parámetro cualquier
propiedad adicional que deba cargar su clase a través de su método init.

---

SECRETARÍA GENERAL DE ADMINISTRACIÓN DIGITAL
Autofirma
172
Esta obra está bajo una licencia Creative Commons Reconocimiento-NoComercial-CompartirIgual 3.0
Unported.