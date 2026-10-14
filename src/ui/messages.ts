/** Textos de los dialogos de soporte. Pueden contener HTML (enlaces e insignias de descarga). */
export interface DialogMessages {
  readonly access_from_pc: string;
  readonly android_download_url: string;
  readonly checktime_warn: string;
  readonly checktime_err: string;
  readonly checktime_local_time: string;
  readonly checktime_server_time: string;
  readonly close: string;
  readonly contact_admin: string;
  readonly error_connecting_autofirma: string;
  readonly error_connecting_client: string;
  readonly error_connecting_service: string;
  readonly error_connecting_server_recovering: string;
  readonly firefox_reinstall_message: string;
  readonly install_client: string;
  readonly ios_download_url: string;
  readonly loading: string;
  readonly no_compatible_procedure: string;
  readonly pc_download_url: string;
  readonly procedure_from_url: string;
  readonly restore_installation: string;
  readonly retry_operation: string;
  readonly timeout_receiving_sign: string;
  readonly unsecure_context: string;
  readonly ok: string;
  readonly warning: string;
}

/** Codigo de idioma soportado. */
export type LocaleCode = "es_ES" | "gl_ES" | "va_ES" | "ca_ES" | "eu_ES" | "en_US";

/** Idiomas incluidos, identicos a los del autoscript.js original. */
export const LOCALES: Readonly<Record<LocaleCode, DialogMessages>> = {
  es_ES: {
    access_from_pc: "Acceda desde un PC para realizar el tr&aacute;mite.",
    android_download_url:
      "<a href='https://play.google.com/store/apps/details?id=es.gob.afirma'><img alt='Desc&aacute;rgalo de Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/es-play-badge-border.png'/></a>",
    checktime_warn:
      "Se ha detectado un desfase horario entre su sistema y el servidor. Se recomienda que se corrija antes de pulsar Aceptar para continuar.",
    checktime_err:
      "Se ha detectado un desfase horario entre su sistema y el servidor. Debe corregir la hora de su sistema y recargar esta p&aacute;gina antes de continuar.",
    checktime_local_time: "Hora de su sistema",
    checktime_server_time: "Hora del servidor",
    close: "Cerrar",
    contact_admin: "Por favor, informe del error si el problema persiste: ",
    error_connecting_autofirma:
      "No es posible conectar con Autofirma debido a un problema de comunicaci&oacute;n o de instalaci&oacute;n del cliente. En caso de no tenerlo instalado, puede descargarse desde el siguiente enlace:",
    error_connecting_client:
      "No es posible conectar con el cliente de firma debido a un problema de comunicaci&oacute;n o de instalaci&oacute;n del cliente. En caso de no tenerlo instalado, puede descargarse desde el siguiente enlace:",
    error_connecting_service:
      "No se ha podido conectar con el servicio de la aplicaci&oacute;n de firma. Es probable que no pueda completar firmas electr&oacute;nicas desde esta p&aacute;gina.",
    error_connecting_server_recovering:
      "No se pudo conectar con el servicio de la aplicaci&oacute;n para recuperar el resultado de la operaci&oacute;n.",
    firefox_reinstall_message:
      "Instalar o restaurar Autofirma requerir&aacute; cerrar el navegador y reiniciar el tr&aacute;mite.",
    install_client:
      "<br>Si lo tiene instalado o lo acaba de instalar, pulse el bot&oacute;n para reintentar la operaci&oacute;n.",
    ios_download_url:
      "<a href='https://apps.apple.com/us/app/cliente-firma-movil/id627410001?itsct=apps_box_badge&amp;itscg=30200'><img src='https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/es-es?size=250x83&amp;releaseDate=1381536000' alt='Descarga en la App Store'></a>",
    loading: "Cargando",
    no_compatible_procedure:
      "Esta aplicaci&oacute;n no permite firmar desde el navegador en dispositivos m&oacute;viles.",
    pc_download_url:
      "<a target='_blank' href='https://firmaelectronica.gob.es/ciudadanos/descargas'>Portal de Firma Electr&oacute;nica</a>",
    procedure_from_url: "Puede realizar el tr&aacute;mite desde la siguiente aplicaci&oacute;n:",
    restore_installation:
      "Si lo tiene instalado, puede restaurar la instalaci&oacute;n desde Autofirma en Herramientas -> Restaurar instalaci&oacute;n",
    retry_operation: "Reintentar operación",
    timeout_receiving_sign:
      "No se ha podido conectar con el cliente de firma. Si no lo tiene instalado, puede descargarlo desde:",
    unsecure_context:
      "El contexto de ejecuci&oacute;n no es seguro y no se usar&aacute;n las funciones de cifrado avanzadas.",
    ok: "Aceptar",
    warning: "Advertencia:",
  },
  gl_ES: {
    access_from_pc: "Acceso desde un PC para realizar o tr&aacute;mite.",
    android_download_url:
      "<a href='https://play.google.com/store/apps/details?id=es.gob.afirma'><img alt='Desc&aacute;rgao de Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/es-play-badge-border.png'/></a>",
    checktime_warn:
      "Destectouse un desfase horario entre o seu sistema e o servidor. Recom&eacute;ndase corrixilo antes de pulsar Aceptar para continuar.",
    checktime_err:
      "Destectouse un desfase horario entre o seu sistema e o servidor. Debe corrixir a hora do seu sistema antes de continuar.",
    checktime_local_time: "Hora do seu sistema",
    checktime_server_time: "Hora do servidor",
    close: "Pechar",
    contact_admin: "Por favor, informe do erro se o problema persiste: ",
    error_connecting_autofirma:
      "Non se puido conectar con Autofirma debido a un problema de comunicaci&oacute;n ou de instalaci&oacute;n do cliente. Se non o tes instalado, p&oacute;dese descargar dende a seguinte ligaz&oacute;n:",
    error_connecting_client:
      "Non se puido conectar ao cliente da sinatura debido a un problema de comunicaci&oacute;n ou de instalaci&oacute;n do cliente. Se non o tes instalado, p&oacute;dese descargar dende a seguinte ligaz&oacute;n:",
    error_connecting_service:
      "Non se puido conectar ao servizo da aplicaci&oacute;n de sinatura. &Eacute; posible que non poida completar sinaturas electr&oacute;nicas desde esta p&aacute;xina.",
    error_connecting_server_recovering:
      "Non se puido conectar ao servizo de aplicaci&oacute;n para recuperar o resultado da operaci&oacute;n",
    firefox_reinstall_message:
      "Ser&aacute; necesario instalar ou restaurar Autofirma pecha o navegador e reinicia o proceso.",
    install_client:
      "Se o tes instalado ou o acabas de instalar, preme o bot&oacute;n para tentar de novo a operaci&oacute;n.",
    ios_download_url:
      "<a href='https://apps.apple.com/us/app/cliente-firma-movil/id627410001?itsct=apps_box_badge&amp;itscg=30200'><img src='https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/es-es?size=250x83&amp;releaseDate=1381536000' alt='Descarga na App Store'></a>",
    loading: "Cargando",
    no_compatible_procedure:
      "Esta aplicaci&oacute;n non permite asinar desde o navegador en dispositivos m&oacute;biles.",
    pc_download_url:
      "<a target='_blank' href='https://firmaelectronica.gob.es/gl/ciudadanos/descargas'>Portal de Sinatura Electr&oacute;nica</a>",
    procedure_from_url: "Podes realizar o tr&aacute;mite dende a seguinte aplicaci&oacute;n:",
    restore_installation:
      "Se o tes instalado, podes restaurar a instalaci&oacute;n desde Autofirma en Ferramentas -> Restaurar instalaci&oacute;n.",
    retry_operation: "Reintento a operación",
    timeout_receiving_sign:
      "Non se puido conectar co cliente que asina. Se non o tes instalado, podes descargalo desde:",
    unsecure_context:
      "O contexto de execución non é seguro e non se usarán as funcións de cifrado avanzadas.",
    ok: "Aceptar",
    warning: "Aviso:",
  },
  va_ES: {
    access_from_pc: "Accedisca des d'un PC per a realitzar el tr&agrave;mit.",
    android_download_url:
      "<a href='https://play.google.com/store/apps/details?id=es.gob.afirma'><img alt='Descarrega-ho de Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/es-play-badge-border.png' style='width: 140px;'/></a>",
    checktime_warn:
      "S'ha detectat un desfasament horari entre el seu sistema i el servidor. Es recomana que es corregisca abans de polsar Acceptar per a continuar.",
    checktime_err:
      "S'ha detectat un desfasament horari entre el seu sistema i el servidor. Ha de corregir l'hora del seu sistema i recarregar esta p&agrave;gina abans de continuar.",
    checktime_local_time: "Hora del seu sistema",
    checktime_server_time: "Hora del servidor",
    close: "Tancar",
    contact_admin: "Per favor, informe de l'error si el problema persisteix: ",
    error_connecting_autofirma:
      "No &eacute;s possible connectar amb Autofirma a causa d'un problema de comunicaci&oacute; o d'instal·laci&oacute; del client. En cas de no tindre-ho instal·lat, pot descarregar-se des del següent enllaç:",
    error_connecting_client:
      "No &eacute;s possible connectar amb el client de signatura a causa d'un problema de comunicaci&oacute; o d'instal·laci&oacute; del client. En cas de no tindre-ho instal·lat, pot descarregar-se des del següent enllaç:",
    error_connecting_service:
      "No s'ha pogut connectar amb el servei de l'aplicaci&oacute; de signatura. &eacute;s probable que no puga completar signatures electr&ograve;niques des d'esta p&agrave;gina.",
    error_connecting_server_recovering:
      "No es va poder connectar amb el servei de l'aplicaci&oacute; per a recuperar el resultat de l'operaci&oacute;.",
    firefox_reinstall_message:
      "Instal·lar o restaurar Autofirma requerir&agrave; tancar el navegador i reiniciar el tr&agrave;mit.",
    install_client:
      "<br>Si el t&eacute; instal·lat o l'acaba d'instal·lar, polse el bot&oacute; per a reintentar l'operaci&oacute;.",
    ios_download_url:
      "<a href='https://apps.apple.com/us/app/cliente-firma-movil/id627410001?itsct=apps_box_badge&amp;itscg=30200' style='display: inline-block; overflow: hidden; border-radius: 13px; width: 140px; height: 40px;'><img src='https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/es-es?size=250x83&amp;releaseDate=1381536000' alt='Desc&agrave;rrega en l&#39;App Store' style='border-radius: 13px; width: 140px; height: 40px;'></a>",
    loading: "Carregant",
    no_compatible_procedure:
      "Esta aplicaci&oacute; no permet signar des del navegador en dispositius m&ograve;bils. ",
    pc_download_url:
      "<a target='_blank' href='https://firmaelectronica.gob.es/va/ciudadanos/descargas'>Portal de Signatura Electr&ograve;nica</a>",
    procedure_from_url: "Pot realitzar el tr&agrave;mit des de la següent aplicaci&oacute;:",
    restore_installation:
      "Si el t&eacute; instal·lat, pot restaurar la instal·laci&oacute; des d'Autofirma en Eines -> Restaurar instal·laci&oacute;",
    retry_operation: "Reintentar operació",
    timeout_receiving_sign:
      "No s'ha pogut connectar amb el client de signatura. Si no el t&eacute; instal·lat, pot descarregar-ho des de:",
    unsecure_context:
      "El context d'execució no és segur i no s'usaran les funcions de xifrat avançades.",
    ok: "Acceptar",
    warning: "Advertiment:",
  },
  ca_ES: {
    access_from_pc: "Accedeixi des d'un PC per a realitzar el tr&agrave;mit.",
    android_download_url:
      "<a href='https://play.google.com/store/apps/details?id=es.gob.afirma'><img alt='Descarrega-ho de Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/es-play-badge-border.png' style='width: 140px;'/></a>",
    checktime_warn:
      "S'ha detectat un desfasament horari entre el seu sistema i el servidor. Es recomana que es corregeixi abans de pr&eacute;mer Acceptar per a continuar.",
    checktime_err:
      "S'ha detectat un desfasament horari entre el seu sistema i el servidor. Ha de corregir l'hora del seu sistema i recarregar aquesta p&agrave;gina abans de continuar.",
    checktime_local_time: "Hora del seu sistema",
    checktime_server_time: "Hora del servidor",
    close: "Tancar",
    contact_admin: "Si us plau, informe de l'error si el problema persisteix: ",
    error_connecting_autofirma:
      "No &eacute;s possible connectar amb Autofirma a causa d'un problema de comunicaci&oacute; o d'instal·laci&oacute; del client. En cas de no tenir-ho instal·lat, pot descarregar-se des del següent enllaç:",
    error_connecting_client:
      "No &eacute;s possible connectar amb el client de signatura a causa d'un problema de comunicaci&oacute; o d'instal·laci&oacute; del client. En cas de no tenir-ho instal·lat, pot descarregar-se des del següent enllaç:",
    error_connecting_service:
      "No s'ha pogut connectar amb el servei de l'aplicaci&oacute; de signatura. &eacute;s probable que no pugui completar signatures electr&ograve;niques des d'aquesta p&agrave;gina.",
    error_connecting_server_recovering:
      "No es va poder connectar amb el servei de l'aplicaci&oacute; per a recuperar el resultat de l'operaci&oacute;.",
    firefox_reinstall_message:
      "Instal·lar o restaurar Autofirma requerir&agrave; tancar el navegador i reiniciar el tr&agrave;mit.",
    install_client:
      "<br>Si el t&eacute; instal·lat o l'acaba d'instal·lar, premi el bot&oacute; per a reintentar l'operaci&oacute;.",
    ios_download_url:
      "<a href='https://apps.apple.com/us/app/cliente-firma-movil/id627410001?itsct=apps_box_badge&amp;itscg=30200' style='display: inline-block; overflow: hidden; border-radius: 13px; width: 140px; height: 40px;'><img src='https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/es-es?size=250x83&amp;releaseDate=1381536000' alt='Desc&agrave;rrega en l&#39;App Store' style='border-radius: 13px; width: 140px; height: 40px;'></a>",
    loading: "Carregant",
    no_compatible_procedure:
      "Aquesta aplicaci&oacute; no permet signar des del navegador en dispositius m&ograve;bils. ",
    pc_download_url:
      "<a target='_blank' href='https://firmaelectronica.gob.es/ca/ciudadanos/descargas'>Portal de Signatura Electr&ograve;nica</a>",
    procedure_from_url: "Pot realitzar el tr&agrave;mit des de la següent aplicaci&oacute;:",
    restore_installation:
      "Si el t&eacute; instal·lat, pot restaurar la instal·laci&oacute; des d'Autofirma en Eines -> Restaurar instal·laci&oacute;",
    retry_operation: "Reintentar operació",
    timeout_receiving_sign:
      "No s'ha pogut connectar amb el client de signatura. Si no el t&eacute; instal·lat, pot descarregar-ho des de:",
    unsecure_context:
      "El context d'execució no és segur i no s'usaran les funcions de xifrat avançades.",
    ok: "Acceptar",
    warning: "Advertiment:",
  },
  eu_ES: {
    access_from_pc: "Sartu PC batetik tramitea egiteko. ",
    android_download_url:
      "<a href='https://play.google.com/store/apps/details?id=es.gob.afirma'><img alt='Deskargatu Google Playtik' src='https://play.google.com/intl/en_us/badges/images/generic/es-play-badge-border.png' style='width: 140px;'/></a>",
    checktime_warn:
      "Zure sistemaren eta zerbitzariaren arteko ordu-desfasea detektatu da. Jarraitzeko, Ados sakatu aurretik zuzentzea gomendatzen da. ",
    checktime_err:
      "Zure sistemaren eta zerbitzariaren artean ordu-desfase bat detektatu da. Zure sistemaren ordua zuzendu behar duzu, eta orri hau kargatu jarraitu aurretik. ",
    checktime_local_time: "Zure sistemaren ordua",
    checktime_server_time: "Zerbitzariaren ordua",
    close: "Itxi",
    contact_admin: "Mesedez, eman akatsaren berri, arazoak bere horretan jarraitzen badu: ",
    error_connecting_autofirma:
      "Ezin da Autofirma-rekin konektatu, bezeroaren komunikazio- edo instalazio-arazo bat dela eta. Instalatuta ez baduzu, esteka honetatik deskarga dezakezu:",
    error_connecting_client:
      "Ezin da bezeroarekin konektatu, komunikazio- edo instalazio-arazo bat dela eta. Instalatuta ez baduzu, esteka honetatik deskarga dezakezu:",
    error_connecting_service:
      "Ezin izan da sinadura-aplikazioaren zerbitzuarekin konektatu. Litekeena da orrialde honetatik sinadura elektronikorik ezin osatzea. ",
    error_connecting_server_recovering:
      "Ezin izan da aplikazioaren zerbitzuarekin konektatu eragiketaren emaitza berreskuratzeko. ",
    firefox_reinstall_message:
      "Autofirma instalatu edo berrezartzeko, nabigatzailea itxi eta izapidea berrabiarazi behar da. ",
    install_client:
      "<br>Instalatuta baduzu edo instalatu berri baduzu, sakatu botoia eragiketa berriro saiatzeko. ",
    ios_download_url:
      "<a href='https://apps.apple.com/us/app/cliente-firma-movil/id627410001?itsct=apps_box_badge&amp;itscg=30200' style='display: inline-block; overflow: hidden; border-radius: 13px; width: 140px; height: 40px;'><img src='https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/es-es?size=250x83&amp;releaseDate=1381536000' alt='Deskargatu App Store-n' style='border-radius: 13px; width: 140px; height: 40px;'></a>",
    loading: "Kargatzen",
    no_compatible_procedure:
      "Aplikazio honek ez du uzten nabigatzailetik gailu mugikorretan sinatzen. ",
    pc_download_url:
      "<a target='_blank' href='https://firmaelectronica.gob.es/eu/ciudadanos/descargas'>Sinadura elektronikoaren ataria</a>",
    procedure_from_url: "Tramitea aplikazio honetatik egin dezakezu:",
    restore_installation:
      "Instalatuta baduzu, instalazioa Autofirma-tik berrezar dezakezu Tresnak aukeran -> Instalazioa leheneratu",
    retry_operation: "Saiatu berriro",
    timeout_receiving_sign:
      "Ezin izan da konektatu sinadura-bezeroarekin. Instalatuta ez baduzu, hemendik deskarga dezakezu:",
    unsecure_context:
      "Exekuzio-testuingurua ez da segurua eta ez dira enkriptatze-funtzio aurreratuak erabiliko.",
    ok: "Onartu",
    warning: "Oharra:",
  },
  en_US: {
    access_from_pc: "Access from a PC to perform the procedure. ",
    android_download_url:
      "<a href='https://play.google.com/store/apps/details?id=es.gob.afirma'><img alt='Download Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/es-play-badge-border.png' style='width: 140px;'/></a>",
    checktime_warn:
      "A time lag between your system and the server has been detected. It is recommended that it be corrected before pressing OK to continue. ",
    checktime_err:
      "A time lag between your system and the server has been detected. You must correct the time of your system and recharge this page before continuing. ",
    checktime_local_time: "Time of your system",
    checktime_server_time: "Server time",
    close: "Close",
    contact_admin: "Please report the error if the problem persists:",
    error_connecting_autofirma:
      "It is not possible to connect with Autofirma due to a communication or installation problem of the client. If you do not have it installed, you can download it from the following link:",
    error_connecting_client:
      "It is not possible to connect with the signature client due to a communication or installation problem of the client. If you do not have it installed, you can download it from the following link:",
    error_connecting_service:
      "It has not been possible to connect with the service of the signature application. You may not be able to complete electronic signatures from this page. ",
    error_connecting_server_recovering:
      "It was not possible to connect with the application service to recover the result of the operation. ",
    firefox_reinstall_message:
      "Installing or restoring Autofirma will require closing the browser and restarting the process. ",
    install_client:
      "<br>If you have it installed or just installed, press the button to retry the operation. ",
    ios_download_url:
      "<a href='https://apps.apple.com/us/app/cliente-firma-movil/id627410001?itsct=apps_box_badge&amp;itscg=30200' style='display: inline-block; overflow: hidden; border-radius: 13px; width: 140px; height: 40px;'><img src='https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/es-es?size=250x83&amp;releaseDate=1381536000' alt='Download from App Store' style='border-radius: 13px; width: 140px; height: 40px;'></a>",
    loading: "Loading",
    no_compatible_procedure:
      "This application does not allow you to sign from your browser on mobile devices. ",
    pc_download_url:
      "<a target='_blank' href='https://firmaelectronica.gob.es/en/ciudadanos/descargas'>Electronic Signature Portal</a>",
    procedure_from_url: "You can complete the procedure from the following application:",
    restore_installation:
      "If you have it installed, you can restore the installation from Autofirma on Tools -> Restore Installation",
    retry_operation: "Retry operation",
    timeout_receiving_sign:
      "It was not possible to connect with the signature client. If you don't have it installed, you can download it from:",
    unsecure_context:
      "The execution context is not secure and advanced encryption functions will not be used.",
    ok: "Ok",
    warning: "Warning:",
  },
};

/** Idioma por defecto. */
export const DEFAULT_LOCALE: LocaleCode = "es_ES";

/** Devuelve los textos de un idioma, o los de `es_ES` si no esta soportado. */
export function localeMessages(locale?: string | null): DialogMessages {
  return locale && Object.hasOwn(LOCALES, locale)
    ? LOCALES[locale as LocaleCode]
    : LOCALES[DEFAULT_LOCALE];
}
