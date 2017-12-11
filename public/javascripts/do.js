var colorList = ["ff5959","e46d89","ff59bb","bf59ff","7646ff","5965ff","599bff","59f1ff","59ff94","439245","aec512","ffc259","ff9b59","743939","923662","365292","368d92","889236","925036"];
var color_index = -1;
var row_id = -1;

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

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

function Oggetto(row_id, name, price, person, tutti_sel) {
    var self = this;
    self.row_id = row_id;
    self.name = name;
    self.price = price;
    self.person = ko.observableArray([person]);
    self.tutti_sel = ko.observable(tutti_sel);
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

    self.removeMembro = function(membro) { self.membri.remove(membro); color_index-=1; row_id-=1; self.calcola(); }

    self.removeKing = function(data,event) { self.dragging = data; }

    self.setKing = function(data,event) { self.dragging.isKing(0); data.isKing(1); self.calcola(); self.currentKing = data;}

    self.dragging = "";
    self.currentKing = self.membri()[0];

    self.kingClick = function(data) {
        self.currentKing.isKing(0);
        data.isKing(1);
        self.currentKing = data;
    }

    /* OGGETTO */

    // Editable data
    self.oggetti = ko.observableArray([]);
    self.total = ko.observable("");

    // Operations
    self.addOggetto = function(name = "Nome prodotto", price = 0) {
        row_id += 1;
        self.oggetti.push(new Oggetto(row_id, name, parseFloat(price).toFixed(2), "Tutti", 1));
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
        oggetto.tutti_sel(0);

    	if (oggetto.person.indexOf(membro.color) < 0) {
    		oggetto.person.push(membro.color);
            var rgb = hexToRgb(membro.color);
            $(event.target).css("box-shadow","0 0 0 3px rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.5)");
            $(event.target).addClass("rid_" + oggetto.row_id);
    	}
    	else {
    		oggetto.person.remove(membro.color);
    		$(event.target).css("box-shadow","none");
            $(event.target).removeClass("rid_" + oggetto.row_id);

            if (oggetto.person().length == 0)
                self.setTutti(oggetto);
    	}

    	self.calcola();
    }

    self.setTutti = function(oggetto) {
        oggetto.tutti_sel(1);
    	oggetto.person = ko.observableArray(["Tutti"]);
        var rid = oggetto.row_id;
    	$(".rid_"+rid).css("box-shadow","none");


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
            		if (j.person.indexOf(i.color) != -1 || j.person.indexOf("Tutti") != -1) { // se l'oggetto è assegnato alla persona in considerazione oppure a tutti
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
