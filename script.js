class Cliente {
    constructor(nome, cognome, evento, preveDate, soldiRicevuti) {
        this.nome = nome;
        this.cognome = cognome;
        this.evento = evento;
        this.preveDate = preveDate;
        this.soldiRicevuti = soldiRicevuti;
    }

    toString() {
        return `${this.nome};${this.cognome};${this.evento};${this.preveDate};${this.soldiRicevuti}`;
    }
}


let clienti = [];


function scriviFile() {
    try {
        const dati = {
            clienti: clienti.map(cliente => ({
                nome: cliente.nome,
                cognome: cliente.cognome,
                evento: cliente.evento,
                preveDate: cliente.preveDate,
                soldiRicevuti: cliente.soldiRicevuti
            })),
            ultimoAggiornamento: new Date().toISOString()
        };
        localStorage.setItem('datiClienti', JSON.stringify(dati));
        console.log('Dati salvati con successo:', dati);
    } catch (error) {
        console.error('Errore durante il salvataggio:', error);
        alert('Errore durante il salvataggio dei dati. Riprova.');
    }
}

function leggiFile() {
    try {
        const datiSalvati = localStorage.getItem('datiClienti');
        if (datiSalvati) {
            const dati = JSON.parse(datiSalvati);
            clienti = dati.clienti.map(cliente => new Cliente(
                cliente.nome,
                cliente.cognome,
                cliente.evento,
                cliente.preveDate,
                cliente.soldiRicevuti
            ));
            console.log('Dati caricati con successo:', clienti);
        } else {
            clienti = [];
            console.log('Nessun dato trovato, inizializzazione array vuoto');
        }
    } catch (error) {
        console.error('Errore durante il caricamento:', error);
        clienti = [];
        alert('Errore durante il caricamento dei dati. I dati verranno reinizializzati.');
    }
}


window.onload = function() {
    leggiFile();
    // Show welcome view by default
    showView('welcome');
};


function creaFile() {
    showView('creaFile');
    // Add event listener to the form
    document.getElementById('creaFileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const fileName = document.getElementById('fileName').value;
        if (fileName) {
            // Create a new file entry in localStorage
            localStorage.setItem('currentFile', fileName);
            // Initialize empty clienti array for the new file
            clienti = [];
            scriviFile();
            showContent(`
                <div class="alert alert-success">
                    <h4>✅ File creato con successo!</h4>
                    <p>Il file "${fileName}" è stato creato e sei pronto per aggiungere clienti.</p>
                </div>
            `);
        } else {
            alert('Per favore inserisci un nome per il file');
        }
    });
}

function avviaCreazioneClienti() {
    const numero = parseInt(document.getElementById('numeroClienti').value);
    if (numero > 0) {
        closeModal();
        creaClientiSequenziale(numero, 0);
    }
}

function creaClientiSequenziale(totale, corrente) {
    if (corrente >= totale) {
        scriviFile();
        showContent(`
            <div class="alert alert-success">
                <h4>✅ File creato con successo!</h4>
                <p>${totale} client${totale === 1 ? 'e' : 'i'} aggiunt${totale === 1 ? 'o' : 'i'} al sistema.</p>
            </div>
        `);
        return;
    }

    showModal(`
        <h3>Cliente ${corrente + 1} di ${totale}</h3>
        <form id="clienteForm">
            <div class="form-group">
                <label>Nome:</label>
                <input type="text" id="nome" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Cognome:</label>
                <input type="text" id="cognome" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Evento:</label>
                <input type="text" id="evento" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Prevendite fornite:</label>
                <input type="number" id="preveDate" class="form-control" min="0" required>
            </div>
            <div class="form-group">
                <label>Soldi ricevuti:</label>
                <input type="number" id="soldiRicevuti" class="form-control" min="0" required>
            </div>
            <div style="margin-top: 20px;">
                <button type="button" class="btn btn-success" onclick="confermaCliente(${totale}, ${corrente})">Conferma Cliente</button>
                <button type="button" class="btn btn-warning" onclick="resetForm()">Reset</button>
            </div>
        </form>
    `);
}

function confermaCliente(totale, corrente) {
    const nome = document.getElementById('nome').value;
    const cognome = document.getElementById('cognome').value;
    const evento = document.getElementById('evento').value;
    const preveDate = parseInt(document.getElementById('preveDate').value);
    const soldiRicevuti = parseInt(document.getElementById('soldiRicevuti').value);

    if (nome && cognome && evento && !isNaN(preveDate) && !isNaN(soldiRicevuti)) {
        clienti.push(new Cliente(nome, cognome, evento, preveDate, soldiRicevuti));
        closeModal();
        creaClientiSequenziale(totale, corrente + 1);
    } else {
        alert('Compila tutti i campi correttamente!');
    }
}

function resetForm() {
    document.getElementById('clienteForm').reset();
}

function modificaClienti() {
    showView('modificaClienti');
    leggiFile();
    
    if (clienti.length === 0) {
        document.getElementById('modificaClientiList').innerHTML = `
            <div class="alert alert-warning">
                <h4>⚠️ Nessun cliente trovato</h4>
                <p>Non ci sono clienti da modificare.</p>
            </div>
        `;
        return;
    }

    let html = `
        <table class="clients-table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Evento</th>
                    <th>Prevendite</th>
                    <th>Pagato</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${clienti.map((cliente, index) => {
                    return `
                        <tr>
                            <td class="client-name">${cliente.nome} ${cliente.cognome}</td>
                            <td class="client-event">${cliente.evento}</td>
                            <td class="client-tickets">${cliente.preveDate} prevendite</td>
                            <td class="client-payment">€${cliente.soldiRicevuti}</td>
                            <td class="client-status"><button class='btn btn-xs btn-primary' style='margin-left:10px;padding:4px 12px;font-size:0.95em;' onclick='apriModificaCliente(${index})'>Modifica</button></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    document.getElementById('modificaClientiList').innerHTML = html;
}

function apriModificaCliente(index) {
    const cliente = clienti[index];
    if (!cliente) return;

    const modalHtml = `
        <div class="modal" id="modificaClienteModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Modifica Cliente</h3>
                    <button class="close-btn" onclick="chiudiModale('modificaClienteModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="modificaClienteForm" class="form-container" onsubmit="return false;">
                        <div class="form-group">
                            <label for="modNome">Nome</label>
                            <input type="text" id="modNome" class="form-control" value="${cliente.nome}" required>
                        </div>
                        <div class="form-group">
                            <label for="modCognome">Cognome</label>
                            <input type="text" id="modCognome" class="form-control" value="${cliente.cognome}" required>
                        </div>
                        <div class="form-group full-width">
                            <label for="modEvento">Evento</label>
                            <input type="text" id="modEvento" class="form-control" value="${cliente.evento}" required>
                        </div>
                        <div class="form-group">
                            <label for="modPreveDate">Prevendite fornite</label>
                            <input type="number" id="modPreveDate" class="form-control" value="${cliente.preveDate}" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="modSoldiRicevuti">Soldi ricevuti</label>
                            <input type="number" id="modSoldiRicevuti" class="form-control" value="${cliente.soldiRicevuti}" min="0" required>
                        </div>
                        <button type="button" class="btn btn-primary" onclick="salvaModificheCliente(${index})">Salva Modifiche</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('modificaClienteModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('modificaClienteModal').style.display = 'block';
}

function showToastSuccess(msg) {
    // Rimuovi eventuale toast precedente
    const oldToast = document.querySelector('.toast-success');
    if (oldToast) oldToast.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-success';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 2000);
}

function salvaModificheCliente(index) {
    const cliente = clienti[index];
    if (!cliente) return;

    // Get form values
    const nome = document.getElementById('modNome').value;
    const cognome = document.getElementById('modCognome').value;
    const evento = document.getElementById('modEvento').value;
    const preveDate = parseInt(document.getElementById('modPreveDate').value);
    const soldiRicevuti = parseInt(document.getElementById('modSoldiRicevuti').value);

    // Validate inputs
    if (!nome || !cognome || !evento || isNaN(preveDate) || isNaN(soldiRicevuti)) {
        alert('Per favore compila tutti i campi correttamente!');
        return;
    }

    // Update customer data
    cliente.nome = nome;
    cliente.cognome = cognome;
    cliente.evento = evento;
    cliente.preveDate = preveDate;
    cliente.soldiRicevuti = soldiRicevuti;

    // Save to localStorage
    scriviFile();

    // Close modal
    chiudiModale('modificaClienteModal');

    // Refresh the view
    modificaClienti();

    // Mostra toast di successo
    showToastSuccess('Modifiche applicate con successo!');
}

function chiudiModale(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

function visualizzaTuttiClienti() {
    showView('tuttiClienti');
    leggiFile();
    if (clienti.length === 0) {
        document.getElementById('clientsList').innerHTML = `
            <div class="alert alert-warning">
                <h4>⚠️ Nessun cliente trovato</h4>
                <p>Non ci sono clienti registrati nel sistema.</p>
            </div>
        `;
        return;
    }

    let html = `
        <table class="clients-table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Evento</th>
                    <th>Prevendite</th>
                    <th>Pagato</th>
                    <th>Stato</th>
                </tr>
            </thead>
            <tbody>
                ${clienti.map((cliente, index) => {
                    const saldoMancante = (cliente.preveDate * 20) - cliente.soldiRicevuti;
                    const statoPagamento = saldoMancante > 0 ? 'unpaid' : 'paid';
                    const statoTesto = saldoMancante > 0 ? `Mancano €${saldoMancante}` : 'Saldato';
                    return `
                        <tr>
                            <td class="client-name">${cliente.nome} ${cliente.cognome}</td>
                            <td class="client-event">${cliente.evento}</td>
                            <td class="client-tickets">${cliente.preveDate} prevendite</td>
                            <td class="client-payment">€${cliente.soldiRicevuti}</td>
                            <td class="client-status"><span class="status-dot status-${statoPagamento}"></span>${statoTesto}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    document.getElementById('clientsList').innerHTML = html;

    // Attiva la ricerca
    const searchInput = document.querySelector('#tuttiClienti-view .search-bar input');
    if (searchInput) {
        searchInput.value = '';
        searchInput.oninput = function() {
            const value = this.value.trim().toLowerCase();
            const filtrati = clienti.filter(c =>
                c.nome.toLowerCase().includes(value) ||
                c.cognome.toLowerCase().includes(value) ||
                c.evento.toLowerCase().includes(value)
            );
            let html = `
                <table class=\"clients-table\">\n<thead>\n<tr>\n<th>Nome</th>\n<th>Evento</th>\n<th>Prevendite</th>\n<th>Pagato</th>\n<th>Stato</th>\n</tr>\n</thead>\n<tbody>\n`;
            html += filtrati.map(cliente => {
                const saldoMancante = (cliente.preveDate * 20) - cliente.soldiRicevuti;
                const statoPagamento = saldoMancante > 0 ? 'unpaid' : 'paid';
                const statoTesto = saldoMancante > 0 ? `Mancano €${saldoMancante}` : 'Saldato';
                return `<tr><td class=\"client-name\">${cliente.nome} ${cliente.cognome}</td><td class=\"client-event\">${cliente.evento}</td><td class=\"client-tickets\">${cliente.preveDate} prevendite</td><td class=\"client-payment\">€${cliente.soldiRicevuti}</td><td class=\"client-status\"><span class=\"status-dot status-${statoPagamento}\"></span>${statoTesto}</td></tr>`;
            }).join('');
            html += `</tbody></table>`;
            document.getElementById('clientsList').innerHTML = html;
        };
    }
}

function ricercaCliente() {
    showView('ricercaCliente');
    // Clear previous results
    document.getElementById('risultatiRicerca').innerHTML = '';
}

function searchCliente() {
    const cognome = document.getElementById('cognome').value;
    if (!cognome) {
        alert('Per favore inserisci un cognome da cercare');
        return;
    }

    const clientiTrovati = clienti.filter(c => 
        c.cognome.toLowerCase().includes(cognome.toLowerCase())
    );

    let searchResultsHtml = '';
    if (clientiTrovati.length === 0) {
        searchResultsHtml = `
            <div class="alert alert-warning">
                <h4>⚠️ Nessun cliente trovato</h4>
                <p>Nessun cliente con cognome "${cognome}" è stato trovato.</p>
            </div>
        `;
    } else {
        searchResultsHtml = `<h3>Risultati ricerca per "${cognome}"</h3>`;
        clientiTrovati.forEach(cliente => {
            searchResultsHtml += `
                <div class="client-card">
                    <h4>${cliente.nome} ${cliente.cognome}</h4>
                    <div class="client-info">
                        <div class="info-item">
                            <div class="info-label">Evento</div>
                            <div class="info-value">${cliente.evento}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Prevendite Fornite</div>
                            <div class="info-value">${cliente.preveDate}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Saldo Ricevuto</div>
                            <div class="info-value">€${cliente.soldiRicevuti}</div>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    document.getElementById('risultatiRicerca').innerHTML = searchResultsHtml;
}

function visualizzaClientiInsoluti() {
    showView('clientiInsoluti');
    leggiFile();
    const clientiInsoluti = clienti.filter(c => (c.soldiRicevuti / 20) < c.preveDate);

    if (clientiInsoluti.length === 0) {
        document.getElementById('insolutiList').innerHTML = `
            <div class="alert alert-success" style="text-align:center; font-size:1.15em; margin-top:30px;">
                <h4>✅ Tutte le prevendite sono state saldate!</h4>
                <p>Non ci sono clienti con prevendite non saldate.</p>
            </div>
        `;
        return;
    }

    let html = `
        <table class="clients-table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Evento</th>
                    <th>Prevendite</th>
                    <th>Pagato</th>
                    <th>Stato</th>
                </tr>
            </thead>
            <tbody>
                ${clientiInsoluti.map(cliente => {
                    const saldoMancante = (cliente.preveDate * 20) - cliente.soldiRicevuti;
                    return `
                        <tr>
                            <td class="client-name">${cliente.nome} ${cliente.cognome}</td>
                            <td class="client-event">${cliente.evento}</td>
                            <td class="client-tickets">${cliente.preveDate} prevendite</td>
                            <td class="client-payment">€${cliente.soldiRicevuti}</td>
                            <td class="client-status"><span class="status-dot status-unpaid"></span>Mancano €${saldoMancante}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('insolutiList').innerHTML = html;
}

function aggiungiCliente() {
    showView('aggiungiCliente');
    // Reset the form
    const form = document.getElementById('nuovoClienteForm');
    if (form) {
        form.reset();
    }
}

function salvaCliente() {
    // Get form values
    const nome = document.getElementById('nuovoNome').value.trim();
    const cognome = document.getElementById('nuovoCognome').value.trim();
    const evento = document.getElementById('nuovoEvento').value.trim();
    const preveDate = parseInt(document.getElementById('nuovePreveDate').value);
    const soldiRicevuti = parseInt(document.getElementById('nuoviSoldiRicevuti').value);

    // Validate inputs
    if (!nome || !cognome || !evento || isNaN(preveDate) || isNaN(soldiRicevuti)) {
        showToastError('Per favore compila tutti i campi correttamente!');
        return;
    }

    // Create new customer
    const nuovoCliente = new Cliente(nome, cognome, evento, preveDate, soldiRicevuti);
    clienti.push(nuovoCliente);
    
    // Save to localStorage
    scriviFile();

    // Mostra toast di successo
    showToastSuccess('Cliente aggiunto con successo!');

    // Reset the form
    document.getElementById('nuovoClienteForm').reset();

    // Log for debugging
    console.log('Nuovo cliente aggiunto:', nuovoCliente);
    console.log('Lista clienti aggiornata:', clienti);
}

function showToastError(msg) {
    // Rimuovi eventuale toast precedente
    const oldToast = document.querySelector('.toast-error');
    if (oldToast) oldToast.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-error';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 2200);
}

function eliminaCliente() {
    showView('eliminaCliente');
    leggiFile();
    if (clienti.length === 0) {
        showContent(`
            <div class="alert alert-warning">
                <h4>⚠️ Nessun cliente da eliminare</h4>
                <p>Non ci sono clienti registrati nel sistema.</p>
            </div>
        `);
        return;
    }
    // Popola il menu a tendina
    const select = document.getElementById('clienteDaEliminare');
    if (select) {
        select.innerHTML = clienti.map((c, i) => `<option value="${i}">${c.nome} ${c.cognome}</option>`).join('');
    }
    // Aggiungi event listener al form per eliminare il cliente selezionato
    const form = document.getElementById('eliminaClienteForm');
    if (form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            const index = parseInt(select.value);
            if (!isNaN(index) && clienti[index]) {
                const clienteEliminato = clienti[index];
                clienti.splice(index, 1);
                scriviFile();
                eliminaCliente(); // aggiorna la lista
                showToastSuccess(`Cliente eliminato: ${clienteEliminato.nome} ${clienteEliminato.cognome}`);
            }
        };
    }
}

function confermaEliminazione() {
    const cognome = document.getElementById('cognomeEliminazione').value;
    if (!cognome) {
        alert('Per favore inserisci il cognome del cliente');
        return;
    }

    const indiceCliente = clienti.findIndex(cliente => cliente.cognome.toLowerCase() === cognome.toLowerCase());
    if (indiceCliente !== -1) {
        const clienteEliminato = clienti[indiceCliente];
        
        
        showModal(`
            <h3>⚠️ Conferma Eliminazione</h3>
            <div class="alert alert-warning">
                <p>Stai per eliminare il seguente cliente:</p>
                <ul style="list-style: none; padding: 10px 0;">
                    <li><strong>Nome:</strong> ${clienteEliminato.nome}</li>
                    <li><strong>Cognome:</strong> ${clienteEliminato.cognome}</li>
                </ul>
                <p>Questa azione non può essere annullata.</p>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                <button class="btn btn-secondary" onclick="closeModal()">Annulla</button>
                <button class="btn btn-danger" onclick="eseguiEliminazione(${indiceCliente})">Conferma Eliminazione</button>
            </div>
        `);
    } else {
        alert('Cliente non trovato!');
    }
}

function eseguiEliminazione(indiceCliente) {
    const clienteEliminato = clienti[indiceCliente];
    clienti.splice(indiceCliente, 1);
    scriviFile();
    closeModal();
    showContent(`
        <div class="alert alert-success">
            <h4>✅ Cliente eliminato</h4>
            <p>${clienteEliminato.nome} ${clienteEliminato.cognome} è stato eliminato dal sistema.</p>
        </div>
    `);
}

function totalePrevendite() {
    showView('totalePrevendite');
    const totale = clienti.reduce((sum, cliente) => sum + cliente.preveDate, 0);
    const saldate = clienti.reduce((sum, cliente) => sum + ((cliente.soldiRicevuti >= cliente.preveDate * 20) ? cliente.preveDate : 0), 0);
    const nonSaldate = clienti.reduce((sum, cliente) => sum + ((cliente.soldiRicevuti < cliente.preveDate * 20) ? cliente.preveDate : 0), 0);

    document.querySelector('#totalePrevendite-view .stats-container').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${saldate}</div>
                <div class="stat-label">Prevendite Vendute e Saldate</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(45deg, #dc3545, #c82333);">
                <div class="stat-value">${nonSaldate}</div>
                <div class="stat-label">Prevendite Non Saldate</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(45deg, #667eea, #764ba2);">
                <div class="stat-value">${totale}</div>
                <div class="stat-label">Totale Prevendite Date</div>
            </div>
        </div>
    `;
}

function incassoTotale() {
    showView('incassoTotale');
    // Incasso già saldato (soldi ricevuti per prevendite saldate)
    const incassoSaldato = clienti.reduce((sum, cliente) => sum + ((cliente.soldiRicevuti >= cliente.preveDate * 20) ? cliente.soldiRicevuti : 0), 0);
    // Incasso da saldare (differenza tra prevendite * 20 e soldi ricevuti per clienti non saldati)
    const incassoDaSaldare = clienti.reduce((sum, cliente) => sum + ((cliente.soldiRicevuti < cliente.preveDate * 20) ? ((cliente.preveDate * 20) - cliente.soldiRicevuti) : 0), 0);
    // Totale incasso previsto
    const incassoPrevisto = clienti.reduce((sum, cliente) => sum + (cliente.preveDate * 20), 0);

    document.querySelector('#incassoTotale-view .stats-container').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">€${incassoSaldato}</div>
                <div class="stat-label">Incasso Già Saldato</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(45deg, #dc3545, #c82333);">
                <div class="stat-value">€${incassoDaSaldare}</div>
                <div class="stat-label">Incasso da Saldare</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(45deg, #667eea, #764ba2);">
                <div class="stat-value">€${incassoPrevisto}</div>
                <div class="stat-label">Totale Incasso Previsto</div>
            </div>
        </div>
    `;
}

function percentualeIncasso() {
    showView('percentualeIncasso');
    const incassoPrevisto = clienti.reduce((sum, cliente) => sum + (cliente.preveDate * 20), 0);
    const incassoAttuale = clienti.reduce((sum, cliente) => sum + cliente.soldiRicevuti, 0);
    const percentuale = Math.round((incassoAttuale / incassoPrevisto) * 100);

    let statsHtml = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">€${incassoPrevisto}</div>
                <div class="stat-label">Incasso Previsto</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">€${incassoAttuale}</div>
                <div class="stat-label">Incasso Attuale</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${percentuale}%</div>
                <div class="stat-label">Percentuale Incasso</div>
            </div>
        </div>
    `;

    document.querySelector('#percentualeIncasso-view .stats-container').innerHTML = statsHtml;
}

function mostraStatistiche() {
    showView('statistiche');
    initializeCharts();
}

function mostraClienti() {
    console.log('Mostra clienti chiamato. Numero clienti:', clienti.length);
    if (clienti.length === 0) {
        showContent(`
            <div class="alert alert-warning">
                <h4>⚠️ Nessun Cliente Trovato</h4>
                <p>Non ci sono clienti registrati nel sistema.</p>
            </div>
        `);
        return;
    }

    let html = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Prevendita</th>
                        <th>Pagato</th>
                        <th>Data Acquisto</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody>
    `;

    clienti.forEach((cliente, index) => {
        html += `
            <tr>
                <td>${cliente.nome}</td>
                <td>${cliente.preveDate}</td>
                <td>${cliente.pagato ? '✅' : '❌'}</td>
                <td>${new Date(cliente.dataAcquisto).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="eliminaCliente(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    showContent(html);
}

// View Management
function showView(viewId) {
    // Hide all views first
    document.querySelectorAll('.view').forEach(view => {
        view.style.display = 'none';
    });
    
    // Show selected view
    const selectedView = document.getElementById(`${viewId}-view`);
    if (selectedView) {
        selectedView.style.display = 'block';
        selectedView.style.opacity = '1';
        selectedView.style.visibility = 'visible';
        selectedView.style.position = 'relative';
        selectedView.style.zIndex = '1';
    } else {
        console.error(`View ${viewId} not found`);
    }
}

// Initialize Charts
function initializeCharts() {
    // Calcolo i dati reali per il grafico a barre (prevendite per evento)
    const eventiMap = {};
    clienti.forEach(cliente => {
        if (!eventiMap[cliente.evento]) eventiMap[cliente.evento] = 0;
        eventiMap[cliente.evento] += cliente.preveDate;
    });
    const eventi = Object.keys(eventiMap);
    const prevenditePerEvento = Object.values(eventiMap);

    // Aggiorno la griglia dei grafici: uno sopra (bar), uno sotto (pie)
    const statsGrid = document.querySelector('#statistiche-view .stats-grid');
    if (statsGrid) {
        statsGrid.innerHTML = `
            <div class="chart-card" style="width:100%;margin-bottom:24px;">
                <h3>Prevendite per Evento</h3>
                <div class="chart-container" style="height:200px;">
                    <canvas id="eventiBarChart"></canvas>
                </div>
            </div>
            <div class="chart-card" style="width:100%;">
                <h3>Incasso Ricevuto vs Mancante</h3>
                <div class="chart-container" style="height:200px;">
                    <canvas id="pagamentiChart"></canvas>
                </div>
            </div>
        `;
    }

    // Grafico a barre: Prevendite per Evento
    const eventiBarCtx = document.getElementById('eventiBarChart').getContext('2d');
    new Chart(eventiBarCtx, {
        type: 'bar',
        data: {
            labels: eventi,
            datasets: [{
                label: 'Prevendite',
                data: prevenditePerEvento,
                backgroundColor: '#667eea',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: '#333', font: { size: 14 } }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#333', font: { size: 14 } }
                }
            }
        }
    });

    // Calcolo i dati reali per il grafico a torta (incasso ricevuto vs mancante)
    const incassoAttuale = clienti.reduce((sum, cliente) => sum + cliente.soldiRicevuti, 0);
    const incassoPrevisto = clienti.reduce((sum, cliente) => sum + (cliente.preveDate * 20), 0);
    const incassoMancante = Math.max(incassoPrevisto - incassoAttuale, 0);

    // Pagamenti Chart (Soldi Ricevuti vs Mancanti)
    const pagamentiCtx = document.getElementById('pagamentiChart').getContext('2d');
    new Chart(pagamentiCtx, {
        type: 'pie',
        data: {
            labels: ['Ricevuto', 'Mancante'],
            datasets: [{
                data: [incassoAttuale, incassoMancante],
                backgroundColor: ['#28a745', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#333',
                        font: { size: 16 }
                    }
                }
            }
        }
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check login state on page load
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('mainContent').style.display = 'flex';
    }
    
    // Show welcome view by default
    showView('welcome');
    
    // Initialize charts when statistics view is shown
    document.querySelector('[onclick="showView(\'statistiche\')"]').addEventListener('click', initializeCharts);
});

function calcolaIncassoPercentuale() {
    const input = document.getElementById('inputPercentuale');
    const box = document.getElementById('percentualeIncassoBox');
    const percentuale = parseFloat(input.value);
    const incassoPrevisto = clienti.reduce((sum, cliente) => sum + (cliente.preveDate * 20), 0);
    const incassoAttuale = clienti.reduce((sum, cliente) => sum + cliente.soldiRicevuti, 0);
    if (isNaN(percentuale) || percentuale < 0 || percentuale > 100) {
        box.innerHTML = '<span style="color:#dc3545;">Inserisci una percentuale valida tra 0 e 100.</span>';
        return;
    }
    const incassoCalcolato = ((percentuale / 100) * incassoPrevisto).toFixed(2);
    box.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">€${incassoAttuale}</div>
                <div class="stat-label">Incasso Attuale</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(45deg, #667eea, #764ba2);">
                <div class="stat-value">€${incassoPrevisto}</div>
                <div class="stat-label">Incasso Previsto</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(45deg, #28a745, #764ba2);">
                <div class="stat-value">€${incassoCalcolato}</div>
                <div class="stat-label">Incasso per ${percentuale}%</div>
            </div>
        </div>
    `;
} 