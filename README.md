# **Kriptografija i mrežna sigurnost - Lab 1**  
### FESB, Računarstvo, 2016/17

U okviru vježbe upoznajemo se s osnovnim sigurnosnim prijetnjama i ranjivostima u računalnim mrežama. Analizirat ćemo ranjivost _ARP (Address Resolution Protocol)_-a. Detaljan tehnički opis ranjivosti _ARP_ mrežnog protokola dostupan je na web stranici predmeta.  

U vježbi ćemo koristiti klijent-server _chat_ aplikaciju pisanu u _Node.js_-u i _Electron_ okviru za razvoj desktop aplikacija. 

## Uputstva za instalaciju i pokretanje Chat@FESB aplikacije
1. Klonirajte ovaj _GitHub_ repozitorij (pri tome koristite _Git Bash_ komandni prozor).  
    ```Bash
    # U osobnom direktoriju (npr. `C:/Users/Mario`) izvršite
    $ git clone https://github.com/mcagalj/CNS-2016-17-lab1.git lab-1  
    $ cd lab-1
    $ ls
   ```
 
2. Uđite u direktorij `chat-at-fesb/` i iz njega pokrenite instalaciju potrebnih _Node.js_ modula/programa korištenjem `npm` naredbe. Potrebni _Node.js_ programi navedeni su u `package.json` konfiguracijskoj skripti.  

    **NAPOMENA**: Instalaciju potrebnih modula možete pokrenuti na identičan način iz Windows komandnog prozora (nije nužno koristiti _Git Bash_ komandni prozor) kao i integriranog terminala u _Visual Studio Code_ editoru (`View > Integrated Terminal`).
    ```Bash
    # U direktoriju `chat-at-fesb/` (npr. `C:/Users/Mario/lab-1/chat-at-fesb`) izvršite
    $ npm install
    ```

3. Pokrenite serversku aplikaciju `server.js` tako da u komandnom prozoru ili _VSC_ integriranom terminalu izvršite sljedeću naredbu:
    ```
    npm run server
    ```
    Na ovaj način `npm` izvršava naredbu `server` koja je zapisana u `package.json` objektu `scripts`. U našem slučaju ovo odgovara naredbi: 
    ```Bash    
    set DEBUG=server & node server.js # Ovo ne izvršavati!
    ```
    Na ovaj postavljate `DEBUG` Windows _enviroment_ varijablu i pokrećete _chat_ server. Postavljena `DEBUG` varijabla omogućuje praćenje događaja i poruka koje server generira u realnom vremenu. Alternativno, server (`server.js`) možete pokrenuti direktno korištenjem naredbe `node` (alternativno `nodemon`).

4. Pokrenite _webpack-dev-server_ izvršavanjem sljedeće naredbe u komandnom prozoru ili _VSC_ integriranom terminalu:
    ```
    npm run watch
    ```
    Kao što možete vidjeti u `package.json` skripti (objektu `scripts`) na ovaj način pokrećemo _webpack development server_ koji će posluživati klijentsku _chat_ aplikaciju. Pri tome [_webpack_](https://webpack.js.org) koristi _webpack.config.js_ konfiguracijsku datoteku za generiranje klijentske aplikacije. Ovakav način pokretanja aplikacije je koristan u tijeku razvoja iste jer _webpack-dev-server_ automatski osvježi aplikaciju (web aplikaciju u našem slučaju) pri svakoj promjeni izvornog koda. Ovaj aspekt _webpack_-a ćete posebno cijeniti kad budete osobno modificirali izvorni kod :-)

5. U istom direktoriju (`chat-at-fesb/`) pokrenite klijentsku _chat_ aplikaciju i pokušajte se povezati sa serverom na lokalnom računalu.  
**NAPOMENA:** U klijentu nije nužno unositi adresu servera ni broj porta ako je server pokrenut na lokalnom računalu i sluša na zadanom portu.
    ```
    npm start
    ```
    Ako je prethodni test bio uspješan pokušajte se povezati na server koji je pokrenut na nekom drugom računalu. Potrebno je resetirati klijentsku aplikaciju (`Ctrl + R`) i unijeti odgovarajuću IP adresu servera. Alternativno, pokrenite lokalno više instanci klijentske aplikacije.