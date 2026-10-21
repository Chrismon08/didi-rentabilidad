DIDI RENTABILIDAD — VERSIÓN 1.1

CONTENIDO
- index.html: estructura de la aplicación
- styles.css: diseño adaptable a iPhone
- app.js: cálculos, límites e historial local
- manifest.webmanifest y sw.js: instalación PWA y caché sin conexión
- icon-192.png / icon-512.png: iconos de la aplicación

FUNCIONES
- Semáforo verde / amarillo / rojo con mensaje, calculado en vivo mientras escribes
- Funciona en iPhone (Safari) y Android (Chrome > Instalar aplicación)
- Ingreso manual de valor, kilómetros y minutos
- Cálculo de ingreso bruto por kilómetro y proyección bruta por hora
- Límites personalizables para marcar una oferta como favorable
- Guardar servicios aceptados o rechazados
- Historial y resumen de ofertas
- Almacenamiento en localStorage del navegador
- Interfaz en español y diseño claro

IMPORTANTE SOBRE LOS CÁLCULOS
La aplicación usa el valor completo de la oferta dividido por kilómetros y el valor multiplicado por 60 dividido por minutos. Son métricas brutas, no utilidad neta. No calcula combustible, trayecto de recogida, peajes, comisiones ni otros costos.
La etiqueta “Buena oferta” se muestra únicamente cuando la oferta alcanza AMBOS límites configurados. Ajusta esos límites según tu vehículo, ciudad y objetivos; no es asesoramiento financiero ni una garantía de rentabilidad.

INSTALAR EN IPHONE COMO PWA
Para que Safari permita “Añadir a pantalla de inicio” y la aplicación funcione sin conexión, aloja los archivos en una dirección HTTPS. La opción gratuita sencilla es GitHub Pages:
1. En un computador, crea una cuenta o inicia sesión en GitHub.
2. Crea un repositorio nuevo, por ejemplo: didi-rentabilidad.
3. Sube todos los archivos de esta carpeta a la raíz del repositorio.
4. En Settings > Pages, configura la publicación desde la rama main y la carpeta /(root). Guarda.
5. Espera a que GitHub Pages muestre la URL HTTPS del sitio.
6. En tu iPhone, abre esa URL en Safari (no dentro del navegador de Instagram).
7. Toca Compartir > Añadir a pantalla de inicio > Añadir.
8. Abre el icono desde la pantalla de inicio. Después de la primera carga correcta, la caché permite usar las funciones principales sin conexión.

PRIVACIDAD Y LIMITACIONES
Los datos se guardan en el almacenamiento local del navegador en ese dispositivo. No se envían a un servidor por el código de esta app. Si borras los datos del sitio, cambias de navegador o dispositivo, o reinstalas de forma que se borre el almacenamiento, podrías perder el historial. Exportación/copia de seguridad no está incluida en esta primera versión.
La app no se conecta con Didi ni lee sus ofertas automáticamente. El registro es manual.
