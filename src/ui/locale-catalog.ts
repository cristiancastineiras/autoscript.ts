export const LOCALE_CODES: readonly ["es_ES", "gl_ES", "va_ES", "ca_ES", "eu_ES", "en_US"] =
  Object.freeze(["es_ES", "gl_ES", "va_ES", "ca_ES", "eu_ES", "en_US"]);

export type DialogLocale = (typeof LOCALE_CODES)[number];
export type DevicePlatform = "android" | "ios" | "desktop";
export type DialogHelpKind =
  | "connection"
  | "timeout"
  | "service"
  | "recovering"
  | "unsupported"
  | "insecure";

export interface DialogLink {
  readonly key?: "android" | "ios" | "pc";
  readonly label: string;
  readonly url: string;
}

export interface DialogAction {
  readonly label: string;
  readonly run: () => void;
}

export interface DialogMessages {
  readonly accessFromPc: string;
  readonly androidDownloadUrl: string;
  readonly androidDownloadLabel: string;
  readonly checkTimeWarn: string;
  readonly checkTimeError: string;
  readonly checkTimeLocalTime: string;
  readonly checkTimeServerTime: string;
  readonly close: string;
  readonly contactAdmin: string;
  readonly errorConnectingAutoFirma: string;
  readonly errorConnectingClient: string;
  readonly errorConnectingService: string;
  readonly errorConnectingServerRecovering: string;
  readonly error: string;
  readonly firefoxReinstallMessage: string;
  readonly installClient: string;
  readonly iosDownloadUrl: string;
  readonly iosDownloadLabel: string;
  readonly loading: string;
  readonly noCompatibleProcedure: string;
  readonly pcDownloadUrl: string;
  readonly pcDownloadLabel: string;
  readonly procedureFromUrl: string;
  readonly restoreInstallation: string;
  readonly retryOperation: string;
  readonly timeoutReceivingSign: string;
  readonly unsecureContext: string;
  readonly ok: string;
  readonly warning: string;
}

export interface DialogHelp {
  readonly text: string;
  readonly links?: readonly DialogLink[];
  readonly action?: DialogAction;
}

const androidStore = "https://play.google.com/store/apps/details?id=es.gob.afirma";
const iosStore = "https://apps.apple.com/us/app/cliente-firma-movil/id627410001";

const messages = {
  es_ES: {
    accessFromPc: "Acceda desde un PC para realizar el trámite.",
    androidDownloadUrl: androidStore,
    androidDownloadLabel: "Descárgalo de Google Play",
    checkTimeWarn:
      "Se ha detectado un desfase horario entre su sistema y el servidor. Se recomienda que se corrija antes de pulsar Aceptar para continuar.",
    checkTimeError:
      "Se ha detectado un desfase horario entre su sistema y el servidor. Debe corregir la hora de su sistema y recargar esta página antes de continuar.",
    checkTimeLocalTime: "Hora de su sistema",
    checkTimeServerTime: "Hora del servidor",
    close: "Cerrar",
    contactAdmin: "Por favor, informe del error si el problema persiste:",
    errorConnectingAutoFirma:
      "No es posible conectar con Autofirma debido a un problema de comunicación o de instalación del cliente. En caso de no tenerlo instalado, puede descargarlo desde el siguiente enlace:",
    errorConnectingClient:
      "No es posible conectar con el cliente de firma debido a un problema de comunicación o de instalación. En caso de no tenerlo instalado, puede descargarlo desde el siguiente enlace:",
    errorConnectingService:
      "No se ha podido conectar con el servicio de la aplicación de firma. Es probable que no pueda completar firmas electrónicas desde esta página.",
    errorConnectingServerRecovering:
      "No se pudo conectar con el servicio de la aplicación para recuperar el resultado de la operación.",
    error: "No se pudo completar la operación.",
    firefoxReinstallMessage:
      "Instalar o restaurar Autofirma requerirá cerrar el navegador y reiniciar el trámite.",
    installClient:
      "Si lo tiene instalado o lo acaba de instalar, pulse el botón para reintentar la operación.",
    iosDownloadUrl: iosStore,
    iosDownloadLabel: "Descarga en la App Store",
    loading: "Cargando",
    noCompatibleProcedure:
      "Esta aplicación no permite firmar desde el navegador en dispositivos móviles.",
    pcDownloadUrl: "https://firmaelectronica.gob.es/ciudadanos/descargas",
    pcDownloadLabel: "Portal de Firma Electrónica",
    procedureFromUrl: "Puede realizar el trámite desde la siguiente aplicación:",
    restoreInstallation:
      "Si lo tiene instalado, puede restaurar la instalación desde Autofirma en Herramientas -> Restaurar instalación.",
    retryOperation: "Reintentar operación",
    timeoutReceivingSign:
      "No se ha podido conectar con el cliente de firma. Si no lo tiene instalado, puede descargarlo desde:",
    unsecureContext:
      "El contexto de ejecución no es seguro y no se usarán las funciones de cifrado avanzadas.",
    ok: "Aceptar",
    warning: "Advertencia:",
  },
  gl_ES: {
    accessFromPc: "Acceda desde un PC para realizar o trámite.",
    androidDownloadUrl: androidStore,
    androidDownloadLabel: "Descárgao de Google Play",
    checkTimeWarn:
      "Detectouse un desfase horario entre o seu sistema e o servidor. Recoméndase corrixilo antes de pulsar Aceptar para continuar.",
    checkTimeError:
      "Detectouse un desfase horario entre o seu sistema e o servidor. Debe corrixir a hora do seu sistema antes de continuar.",
    checkTimeLocalTime: "Hora do seu sistema",
    checkTimeServerTime: "Hora do servidor",
    close: "Pechar",
    contactAdmin: "Por favor, informe do erro se o problema persiste:",
    errorConnectingAutoFirma:
      "Non se puido conectar con Autofirma debido a un problema de comunicación ou de instalación do cliente. Se non o tes instalado, podes descargalo dende a seguinte ligazón:",
    errorConnectingClient:
      "Non se puido conectar ao cliente da sinatura debido a un problema de comunicación ou de instalación. Se non o tes instalado, podes descargalo dende a seguinte ligazón:",
    errorConnectingService:
      "Non se puido conectar ao servizo da aplicación de sinatura. É posible que non poida completar sinaturas electrónicas desde esta páxina.",
    errorConnectingServerRecovering:
      "Non se puido conectar ao servizo da aplicación para recuperar o resultado da operación.",
    error: "Non se puido completar a operación.",
    firefoxReinstallMessage:
      "Instalar ou restaurar Autofirma requirirá pechar o navegador e reiniciar o proceso.",
    installClient:
      "Se o tes instalado ou o acabas de instalar, preme o botón para tentar de novo a operación.",
    iosDownloadUrl: iosStore,
    iosDownloadLabel: "Descarga na App Store",
    loading: "Cargando",
    noCompatibleProcedure:
      "Esta aplicación non permite asinar desde o navegador en dispositivos móbiles.",
    pcDownloadUrl: "https://firmaelectronica.gob.es/gl/ciudadanos/descargas",
    pcDownloadLabel: "Portal de Sinatura Electrónica",
    procedureFromUrl: "Podes realizar o trámite dende a seguinte aplicación:",
    restoreInstallation:
      "Se o tes instalado, podes restaurar a instalación desde Autofirma en Ferramentas -> Restaurar instalación.",
    retryOperation: "Reintentar operación",
    timeoutReceivingSign:
      "Non se puido conectar co cliente que asina. Se non o tes instalado, podes descargalo desde:",
    unsecureContext:
      "O contexto de execución non é seguro e non se usarán as funcións de cifrado avanzadas.",
    ok: "Aceptar",
    warning: "Aviso:",
  },
  va_ES: {
    accessFromPc: "Accedisca des d'un PC per a realitzar el tràmit.",
    androidDownloadUrl: androidStore,
    androidDownloadLabel: "Descarrega-ho de Google Play",
    checkTimeWarn:
      "S'ha detectat un desfasament horari entre el seu sistema i el servidor. Es recomana corregir-lo abans de polsar Acceptar per a continuar.",
    checkTimeError:
      "S'ha detectat un desfasament horari entre el seu sistema i el servidor. Ha de corregir l'hora del seu sistema i tornar a carregar esta pàgina abans de continuar.",
    checkTimeLocalTime: "Hora del seu sistema",
    checkTimeServerTime: "Hora del servidor",
    close: "Tancar",
    contactAdmin: "Per favor, informe de l'error si el problema persisteix:",
    errorConnectingAutoFirma:
      "No és possible connectar amb Autofirma a causa d'un problema de comunicació o d'instal·lació del client. Si no el té instal·lat, pot descarregar-lo des de l'enllaç següent:",
    errorConnectingClient:
      "No és possible connectar amb el client de signatura a causa d'un problema de comunicació o d'instal·lació. Si no el té instal·lat, pot descarregar-lo des de l'enllaç següent:",
    errorConnectingService:
      "No s'ha pogut connectar amb el servei de l'aplicació de signatura. És probable que no puga completar signatures electròniques des d'esta pàgina.",
    errorConnectingServerRecovering:
      "No s'ha pogut connectar amb el servei de l'aplicació per a recuperar el resultat de l'operació.",
    error: "No s'ha pogut completar l'operació.",
    firefoxReinstallMessage:
      "Instal·lar o restaurar Autofirma requerirà tancar el navegador i reiniciar el tràmit.",
    installClient:
      "Si el té instal·lat o l'acaba d'instal·lar, polse el botó per a reintentar l'operació.",
    iosDownloadUrl: iosStore,
    iosDownloadLabel: "Descàrrega en l'App Store",
    loading: "Carregant",
    noCompatibleProcedure:
      "Esta aplicació no permet signar des del navegador en dispositius mòbils.",
    pcDownloadUrl: "https://firmaelectronica.gob.es/va/ciudadanos/descargas",
    pcDownloadLabel: "Portal de Signatura Electrònica",
    procedureFromUrl: "Pot realitzar el tràmit des de l'aplicació següent:",
    restoreInstallation:
      "Si el té instal·lat, pot restaurar la instal·lació des d'Autofirma en Eines -> Restaurar instal·lació.",
    retryOperation: "Reintentar operació",
    timeoutReceivingSign:
      "No s'ha pogut connectar amb el client de signatura. Si no el té instal·lat, pot descarregar-lo des de:",
    unsecureContext:
      "El context d'execució no és segur i no s'usaran les funcions de xifrat avançades.",
    ok: "Acceptar",
    warning: "Advertiment:",
  },
  ca_ES: {
    accessFromPc: "Accedeixi des d'un PC per a realitzar el tràmit.",
    androidDownloadUrl: androidStore,
    androidDownloadLabel: "Descarrega-ho de Google Play",
    checkTimeWarn:
      "S'ha detectat un desfasament horari entre el seu sistema i el servidor. Es recomana corregir-lo abans de prémer Acceptar per a continuar.",
    checkTimeError:
      "S'ha detectat un desfasament horari entre el seu sistema i el servidor. Ha de corregir l'hora del seu sistema i tornar a carregar aquesta pàgina abans de continuar.",
    checkTimeLocalTime: "Hora del seu sistema",
    checkTimeServerTime: "Hora del servidor",
    close: "Tancar",
    contactAdmin: "Si us plau, informe de l'error si el problema persisteix:",
    errorConnectingAutoFirma:
      "No és possible connectar amb Autofirma a causa d'un problema de comunicació o d'instal·lació del client. Si no el té instal·lat, pot descarregar-lo des de l'enllaç següent:",
    errorConnectingClient:
      "No és possible connectar amb el client de signatura a causa d'un problema de comunicació o d'instal·lació. Si no el té instal·lat, pot descarregar-lo des de l'enllaç següent:",
    errorConnectingService:
      "No s'ha pogut connectar amb el servei de l'aplicació de signatura. És probable que no pugui completar signatures electròniques des d'aquesta pàgina.",
    errorConnectingServerRecovering:
      "No s'ha pogut connectar amb el servei de l'aplicació per recuperar el resultat de l'operació.",
    error: "No s'ha pogut completar l'operació.",
    firefoxReinstallMessage:
      "Instal·lar o restaurar Autofirma requerirà tancar el navegador i reiniciar el tràmit.",
    installClient:
      "Si el té instal·lat o l'acaba d'instal·lar, premi el botó per tornar a intentar l'operació.",
    iosDownloadUrl: iosStore,
    iosDownloadLabel: "Descàrrega a l'App Store",
    loading: "Carregant",
    noCompatibleProcedure:
      "Aquesta aplicació no permet signar des del navegador en dispositius mòbils.",
    pcDownloadUrl: "https://firmaelectronica.gob.es/ca/ciudadanos/descargas",
    pcDownloadLabel: "Portal de Signatura Electrònica",
    procedureFromUrl: "Pot realitzar el tràmit des de l'aplicació següent:",
    restoreInstallation:
      "Si el té instal·lat, pot restaurar la instal·lació des d'Autofirma a Eines -> Restaurar instal·lació.",
    retryOperation: "Reintentar operació",
    timeoutReceivingSign:
      "No s'ha pogut connectar amb el client de signatura. Si no el té instal·lat, pot descarregar-lo des de:",
    unsecureContext:
      "El context d'execució no és segur i no s'usaran les funcions de xifrat avançades.",
    ok: "Acceptar",
    warning: "Advertiment:",
  },
  eu_ES: {
    accessFromPc: "Sartu PC batetik tramitea egiteko.",
    androidDownloadUrl: androidStore,
    androidDownloadLabel: "Deskargatu Google Playtik",
    checkTimeWarn:
      "Zure sistemaren eta zerbitzariaren arteko ordu-desfasea detektatu da. Jarraitzeko, Ados sakatu aurretik zuzentzea gomendatzen da.",
    checkTimeError:
      "Zure sistemaren eta zerbitzariaren artean ordu-desfase bat detektatu da. Zure sistemaren ordua zuzendu behar duzu, eta orri hau kargatu jarraitu aurretik.",
    checkTimeLocalTime: "Zure sistemaren ordua",
    checkTimeServerTime: "Zerbitzariaren ordua",
    close: "Itxi",
    contactAdmin: "Mesedez, eman akatsaren berri, arazoak bere horretan jarraitzen badu:",
    errorConnectingAutoFirma:
      "Ezin da Autofirmarekin konektatu, bezeroaren komunikazio- edo instalazio-arazo bat dela eta. Instalatuta ez baduzu, esteka honetatik deskarga dezakezu:",
    errorConnectingClient:
      "Ezin da bezeroarekin konektatu, komunikazio- edo instalazio-arazo bat dela eta. Instalatuta ez baduzu, esteka honetatik deskarga dezakezu:",
    errorConnectingService:
      "Ezin izan da sinadura-aplikazioaren zerbitzuarekin konektatu. Litekeena da orrialde honetatik sinadura elektronikorik ezin osatzea.",
    errorConnectingServerRecovering:
      "Ezin izan da aplikazioaren zerbitzuarekin konektatu eragiketaren emaitza berreskuratzeko.",
    error: "Ezin izan da eragiketa osatu.",
    firefoxReinstallMessage:
      "Autofirma instalatu edo berrezartzeko, nabigatzailea itxi eta izapidea berrabiarazi behar da.",
    installClient:
      "Instalatuta baduzu edo instalatu berri baduzu, sakatu botoia eragiketa berriro saiatzeko.",
    iosDownloadUrl: iosStore,
    iosDownloadLabel: "Deskargatu App Store-n",
    loading: "Kargatzen",
    noCompatibleProcedure:
      "Aplikazio honek ez du uzten nabigatzailetik gailu mugikorretan sinatzen.",
    pcDownloadUrl: "https://firmaelectronica.gob.es/eu/ciudadanos/descargas",
    pcDownloadLabel: "Sinadura elektronikoaren ataria",
    procedureFromUrl: "Tramitea aplikazio honetatik egin dezakezu:",
    restoreInstallation:
      "Instalatuta baduzu, instalazioa Autofirmatik berrezar dezakezu Tresnak aukeran -> Instalazioa leheneratu.",
    retryOperation: "Saiatu berriro",
    timeoutReceivingSign:
      "Ezin izan da konektatu sinadura-bezeroarekin. Instalatuta ez baduzu, hemendik deskarga dezakezu:",
    unsecureContext:
      "Exekuzio-testuingurua ez da segurua eta ez dira enkriptatze-funtzio aurreratuak erabiliko.",
    ok: "Onartu",
    warning: "Oharra:",
  },
  en_US: {
    accessFromPc: "Access from a PC to perform the procedure.",
    androidDownloadUrl: androidStore,
    androidDownloadLabel: "Download from Google Play",
    checkTimeWarn:
      "A time lag between your system and the server has been detected. It is recommended that it be corrected before pressing OK to continue.",
    checkTimeError:
      "A time lag between your system and the server has been detected. You must correct the time of your system and reload this page before continuing.",
    checkTimeLocalTime: "Time of your system",
    checkTimeServerTime: "Server time",
    close: "Close",
    contactAdmin: "Please report the error if the problem persists:",
    errorConnectingAutoFirma:
      "It is not possible to connect with AutoFirma due to a communication or installation problem. If you do not have it installed, you can download it from the following link:",
    errorConnectingClient:
      "It is not possible to connect with the signature client due to a communication or installation problem. If you do not have it installed, you can download it from the following link:",
    errorConnectingService:
      "It has not been possible to connect with the signature application's service. You may not be able to complete electronic signatures from this page.",
    errorConnectingServerRecovering:
      "It was not possible to connect with the application service to recover the operation result.",
    error: "The operation could not be completed.",
    firefoxReinstallMessage:
      "Installing or restoring AutoFirma will require closing the browser and restarting the procedure.",
    installClient:
      "If you have it installed or just installed it, press the button to retry the operation.",
    iosDownloadUrl: iosStore,
    iosDownloadLabel: "Download from the App Store",
    loading: "Loading",
    noCompatibleProcedure:
      "This application does not allow signing from the browser on mobile devices.",
    pcDownloadUrl: "https://firmaelectronica.gob.es/en/ciudadanos/descargas",
    pcDownloadLabel: "Electronic Signature Portal",
    procedureFromUrl: "You can complete the procedure from the following application:",
    restoreInstallation:
      "If you have it installed, you can restore the installation from AutoFirma under Tools -> Restore Installation.",
    retryOperation: "Retry operation",
    timeoutReceivingSign:
      "It was not possible to connect with the signature client. If you do not have it installed, you can download it from:",
    unsecureContext:
      "The execution context is not secure and advanced encryption functions will not be used.",
    ok: "OK",
    warning: "Warning:",
  },
} satisfies Record<DialogLocale, DialogMessages>;

export function isDialogLocale(locale: string): locale is DialogLocale {
  return (LOCALE_CODES as readonly string[]).includes(locale);
}

export function resolveDialogLocale(locale: string): DialogLocale {
  return isDialogLocale(locale) ? locale : "es_ES";
}

export function dialogMessages(locale: string): DialogMessages {
  return messages[resolveDialogLocale(locale)];
}

export function localizedHelp(
  locale: string,
  kind: DialogHelpKind,
  platform: DevicePlatform,
  isFirefox = false,
): DialogHelp {
  const text = dialogMessages(locale);
  const mobile = platform !== "desktop";
  const download =
    platform === "android"
      ? { key: "android" as const, label: text.androidDownloadLabel, url: text.androidDownloadUrl }
      : platform === "ios"
        ? { key: "ios" as const, label: text.iosDownloadLabel, url: text.iosDownloadUrl }
        : { key: "pc" as const, label: text.pcDownloadLabel, url: text.pcDownloadUrl };

  switch (kind) {
    case "connection":
      return {
        text: mobile
          ? `${text.errorConnectingClient} ${text.installClient}`
          : `${text.errorConnectingAutoFirma} ${text.installClient} ${text.restoreInstallation}${isFirefox ? ` ${text.firefoxReinstallMessage}` : ""}`,
        links: [download],
      };
    case "timeout":
      return { text: `${text.timeoutReceivingSign} ${text.installClient}`, links: [download] };
    case "service":
      return { text: text.errorConnectingService };
    case "recovering":
      return { text: text.errorConnectingServerRecovering };
    case "unsupported":
      return { text: `${text.noCompatibleProcedure} ${text.accessFromPc}` };
    case "insecure":
      return { text: text.unsecureContext };
  }
}
