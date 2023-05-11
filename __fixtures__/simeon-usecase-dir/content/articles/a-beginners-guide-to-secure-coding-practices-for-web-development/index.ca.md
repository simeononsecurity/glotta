---
title: "Pràctiques de codificació segura per al desenvolupament web: una guia per a principiants"
date: 2023-03-14
toc: true
draft: false
description: "Aprèn pràctiques de codificació segura essencials per al desenvolupament web per crear aplicacions web segures i reduir el risc d'atacs cibernètics".
tags: ["Pràctiques de codificació segura","Desenvolupament web","Paisatge de la ciberseguretat","OWASP Top Ten","Atacs d'injecció SQL","XSS","CSRF","Cicle de vida del desenvolupament segur","Validació d'entrada","Escape de la sortida","Protocols de comunicació segurs","Controls d'accés","Emmagatzematge i tractament de dades","El mínim privilegi","Hashing de contrasenya","Xifrat de dades","Declaracions preparades","Dades sensibles","Atacs cibernètics","Seguretat web"]
cover: "/img/cover/A_cartoon_developer_standing_confidently_in_front_of_a_shield.png"
coverAlt: "Un desenvolupador de dibuixos animats que es troba confiat davant d'un escut amb un símbol de pany mentre sosté un ordinador portàtil".
coverCaption: ""
---

En l'era digital actual, el desenvolupament web és un camp que creix ràpidament. Els llocs web i les aplicacions són un component vital de les empreses i organitzacions i, com a tal, la **seguretat** és de la màxima importància. En aquesta guia per a principiants, explorarem algunes **pràctiques de codificació segura** essencials a seguir en el desenvolupament web. Al final d'aquest article, tindreu una comprensió sòlida de com crear aplicacions web segures i reduir el risc d'atacs cibernètics.

## Entendre els fonaments bàsics

Abans d'aprofundir en les pràctiques de codificació segura, és important tenir una comprensió bàsica del **paisatge de la ciberseguretat**. **Els ciberatacs** són una amenaça constant i, com a desenvolupador web, heu de prendre les mesures necessàries per protegir el vostre lloc web i les dades dels usuaris.

### Ciberatacs comuns

Alguns tipus comuns d'atacs cibernètics inclouen:

- **Atacs per injecció SQL**: els atacants utilitzen la injecció SQL per accedir a dades sensibles de bases de dades. Aquest atac es pot prevenir validant l'entrada de l'usuari i utilitzant consultes parametritzades.
- **Cross-site scripting (XSS)**: els atacants injecten scripts maliciosos a les pàgines web per robar dades d'usuari o segrestar sessions d'usuari. Aquest atac es pot prevenir desinfectant l'entrada de l'usuari i la sortida de codificació.
- **Falsificació de sol·licituds entre llocs (CSRF)**: els atacants enganyen els usuaris perquè executin accions no desitjades en una aplicació web. Aquest atac es pot prevenir utilitzant fitxes anti-CSRF i validant l'origen de la sol·licitud.

### OWASP Top Ten

El **Open Web Application Security Project (OWASP)** publica una llista dels deu riscos de seguretat de les aplicacions web més crítics. Això inclou:

1.[**Injection flaws**](https://owasp.org/www-community/Injection_Flaws)
2.[**Broken authentication and session management**](https://owasp.org/www-project-top-ten/2017/A2_2017-Broken_Authentication.html)
3.[**Cross-site scripting (XSS)**](https://owasp.org/www-project-top-ten/2017/A7_2017-Cross-Site_Scripting_(XSS).html)
4.[**Broken access controls**](https://owasp.org/www-project-top-ten/2017/A5_2017-Broken_Access_Control.html)
5.[**Security misconfigurations**](https://owasp.org/www-project-top-ten/2017/A6_2017-Security_Misconfiguration.html)
6.[**Insecure cryptographic storage**](https://owasp.deteact.com/cheat/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
7.[**Insufficient transport layer protection**](https://owasp.org/www-project-mobile-top-10/2014-risks/m3-insufficient-transport-layer-protection)
8.[**Improper error handling**](https://owasp.org/www-community/Improper_Error_Handling)
9.[**Insecure communication between components**](https://owasp.org/www-project-mobile-top-10/2016-risks/m3-insecure-communication)
10.[**Poor code quality**](https://owasp.org/www-project-mobile-top-10/2016-risks/m7-client-code-quality)

## Millors pràctiques

### Utilitzeu un cicle de vida de desenvolupament segur (SDLC)

A[**Secure Development Lifecycle (SDLC)**](https://en.wikipedia.org/wiki/Systems_development_life_cycle) és un conjunt de processos que integra la seguretat en el procés de desenvolupament. Això ajuda a identificar i mitigar els riscos de seguretat al principi del cicle de desenvolupament. Un SDLC inclou les fases següents:

1. **Planificació**
2. **Recollida de requisits**
3. **Disseny**
4. **Implementació**
5. **Proves**
6. **Desplegament**
7. **Manteniment**

### Valida l'entrada i la sortida d'escapament

**La validació d'entrada** és el procés de comprovació de l'entrada de l'usuari per assegurar-se que s'ajusta als formats i valors de dades esperats. **L'escapament de la sortida** és el procés de codificació de dades per evitar que s'interpretin com a codi. Validar correctament l'entrada i la sortida d'escapament pot evitar la injecció SQL, XSS i altres tipus d'atacs.

### Utilitzeu protocols de comunicació segurs

Les aplicacions web haurien d'utilitzar **protocols de comunicació segurs** com ara HTTPS per xifrar les dades en trànsit. HTTPS garanteix que els atacants no puguin interceptar ni modificar les dades. A més, és essencial utilitzar mecanismes d'autenticació segurs com ara OAuth, OpenID o SAML.

### Implementar controls d'accés

Els **controls d'accés** s'utilitzen per limitar l'accés als recursos en funció dels rols i els permisos dels usuaris. Els controls d'accés adequats poden evitar l'accés no autoritzat a dades i funcionalitats sensibles. També és important seguir el principi del **privilegi mínim**, que significa concedir als usuaris només els permisos mínims necessaris per dur a terme les seves tasques.

### Emmagatzematge i tractament segur de dades

Les dades sensibles, com ara contrasenyes, informació de targetes de crèdit i informació personal, s'han d'emmagatzemar de manera segura. Les contrasenyes s'han de triturar i salar, i la informació de la targeta de crèdit s'ha de xifrar. A més, és important gestionar de manera segura les dades validant l'entrada de l'usuari, utilitzant declaracions preparades i eliminant correctament les dades sensibles.

______

En conclusió, la seguretat de les aplicacions web és crucial i, com a desenvolupador web, és la vostra responsabilitat assegurar-vos que les vostres aplicacions siguin segures. Seguint aquestes **pràctiques de codificació segura** i mantenint-vos al dia de les últimes amenaces i contramesures de seguretat, podeu ajudar a protegir el vostre lloc web i les dades dels usuaris dels ciberatacs. Recordeu que la seguretat no és un esforç puntual, sinó un procés continu que requereix atenció i esforç continus.

## Referències

- Projecte Top Ten OWASP. (n.d.). Recuperat el 28 de febrer de 2023 a https://owasp.org/Top10/