var colorList = ["ff5959","e46d89","ff59bb","bf59ff","7646ff","5965ff","599bff","59f1ff","59ff94","439245","aec512","ffc259","ff9b59","743939","923662","365292","368d92","889236","925036"];
var color_index = -1;

function getRandomColor() {
    var letters = '8BCDE'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}

function getColor()
{
    color_index += 1;
    return "#" + colorList[color_index];
}

function Oggetto(name, price, person) {
    var self = this;
    self.name = name;
    self.price = price;
    self.person = ko.observableArray([person]);
}

function Membro(name, color, isKing, money) {
    var self = this;
    self.name = ko.observable(name);
    self.color = color;
    self.isKing = ko.observable(isKing);
    self.money = ko.observable(money.toFixed(2));
}

function OggettoViewModel() {
    var self = this;

    /* MEMBRO 8===D */

    // Editable data
    self.membri = ko.observableArray([
        new Membro("King", getColor(), 1, 0)
    ]);

    // Operations
    self.addMembro = function() {
        self.membri.push(new Membro("Nome", getColor(), 0, 0));
        self.calcola();
    }

    self.removeMembro = function(membro) { self.membri.remove(membro); color_index-=1; self.calcola(); }

    self.removeKing = function(data,event) { self.dragging = data; }

    self.setKing = function(data,event) { self.dragging.isKing(0); data.isKing(1); self.calcola();}

    self.dragging = "";

    /* OGGETTO */

    // Editable data
    self.oggetti = ko.observableArray([]);
    self.total = ko.observable("");

    // Operations
    self.addOggetto = function(name = "Nome prodotto", price = 0) {
        self.oggetti.push(new Oggetto(name, price.toFixed(2), "Tutti" ));
        self.calcola();
    }

    self.addOggettoWrapper = function() { self.addOggetto(); }

    self.removeOggetto = function(oggetto) { self.oggetti.remove(oggetto); self.calcola(); }

    self.computeTotal = function() {
        var sum = 0;
        self.oggetti().forEach(function(item) {
            sum += parseFloat(item.price || 0);
        });
        self.total(sum.toFixed(2));
    }

    self.changeAssignedPerson = function(membro,oggetto,event) {
    	oggetto.person.remove("Tutti");

    	if (oggetto.person.indexOf(membro.name()) < 0) {
    		oggetto.person.push(membro.name());
    		$(event.target).addClass("selected");
    	}
    	else {
    		oggetto.person.remove(membro.name());
    		$(event.target).removeClass("selected");
    	}

    	self.calcola();
    }

    self.setTutti = function(oggetto) {
    	oggetto.person = ko.observableArray(["Tutti"]);
    	$(".btn").removeClass("selected");
    	self.calcola();
    }

    /* CALCOLI */

    self.calcola = function(oggetto) {
        self.computeTotal();

    	var total = 0;
        ko.utils.arrayForEach(self.oggetti(), function(feature) {
            total += parseFloat(feature.price);
        });

		ko.utils.arrayForEach(self.membri(), function(i) {
			var tot_persona = 0;
            ko.utils.arrayForEach(self.oggetti(), function(j) {
            	if (i.isKing() == 0) // se non è il king che ha pagato tutto
            	{
            		if (j.person.indexOf(i.name()) != -1 || j.person.indexOf("Tutti") != -1) { // se l'oggetto è assegnato alla persona in considerazione oppure a tutti
            			var money = 0;
            			if (j.person.indexOf("Tutti") != -1)
            				money = parseFloat(j.price || 0) / parseFloat(self.membri().length);
            			else
            				money = parseFloat(j.price || 0) / parseFloat(j.person().length);

            			tot_persona += money;

            			//console.log("Persona: " + i.name() + " paga " + j.name + " " + money + " euri");
            		}
            	}
        	});

            tot_persona = tot_persona || 0;
            i.money(tot_persona.toFixed(2));
        	//console.log("  TOTALE: " + tot_persona);
        });
    }

}

var vm = new OggettoViewModel()
ko.applyBindings(vm);
