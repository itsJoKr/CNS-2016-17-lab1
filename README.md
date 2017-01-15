# **Kriptografija i mrežna sigurnost - Lab 1**  
### FESB, Računarstvo, 2016/17

U okviru vježbe upoznajemo se s osnovnim sigurnosnim prijetnjama i ranjivostima u računalnim mrežama. Analizirat ćemo ranjivost _ARP (Address Resolution Protocol)_-a. Detaljan tehnički opis ranjivosti _ARP_ mrežnog protokola dostupan je na web stranici predmeta.  

U vježbi ćemo koristiti klijent-server _chat_ aplikaciju pisanu u _Node.js_-u i _Electron_ okviru za razvoj desktop aplikacija. 

## Uputstva za instalaciju i pokretanje
1. Klonirajte ovaj _GitHub_ repozitorij.  
    ```Bash
    # U osobnom direktoriju (npr. `C:/Users/Mario`) izvršite
    $ git clone https://github.com/mcagalj/CNS-2016-17.git lab-1  
    $ cd lab-1
    $ ls
   ```
 
2. Uđite u direktorij `chat-at-fesb/` i iz njega pokrenite instalaciju potrebnih _Node.js_ modula/programa korištenjem `npm` naredbe. Potrebni _Node.js_ programi navedeni su u `package.json` konfiguracijskoj skripti.  
**NAPOMENA**: Instalaciju potrebnih programa možete pokrenuti na identičan način i iz Windows komandnog prozora (nije nužno koristiti _Git Bash_ komandni prozor).
    ```Bash
    # U direktoriju `chat-at-fesb/` (npr. `C:/Users/Mario/lab-1/chat-at-fesb`) izvršite
    $ npm install
    ```

3. Pokrenite serversku aplikaciju `server.js` na sljedeći način. Otvorite novi Windows komandni prozor i postavite `DEBUG` Windows _enviroment_ varijablu kako slijedi:
    ```
    set DEBUG=server
    ```
    Na ovaj način će te moći pratiti u realnom vremenu događaje i poruke koje server generira. Uđite u direktorij `chat-at-fesb/`, koji se nalazi u direktoriju u koji ste prethodno klonirali _GitHub_ repozotorij (npr. u `C:/Users/Mario/lab-1`). Pokrenite serversku skriptu `server.js` korištenjem naredbe `node` (alternativno `nodemon`).
    ```
    node server.js
    ```

4. U istom direktoriju (`chat-at-fesb/`) pokrenite klijentsku _chat_ aplikaciju i pokušajte se povezati sa serverom na lokalnom računalu.  
**NAPOMENA:** U klijentu nije nužno unositi adresu ni broj porta ako je server pokrenut na lokalnom računalu i sluša na zadanom portu.
    ```
    npm start
    ```
    Ako je prethodni test bio uspješan pokušajte se povezati na server koji je pokrenut na nekom drugom udaljenom računalu. Potrebno je resetirati klijentsku aplikaciju (`Ctrl + R`) i unijeti odgovarajuću IP adresu servera.

