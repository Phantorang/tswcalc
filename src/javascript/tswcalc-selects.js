var tswcalc = tswcalc || {};
tswcalc.select = tswcalc.select || {};

tswcalc.select.SelectHandler = function SelectHandler(slot) {
    var self = this;
    var slotObj = tswcalc.slots[slot.id_prefix];

    this.initiate = function() {
        this.bindEvents();
        this.addSignetsToSelect();
    };

    this.bindEvents = function() {
        if (slotObj.isWeapon()) {
            slotObj.el.wtype.change(this.wtypeChange);
        } else {
            slotObj.el.role.change(this.roleChange);
        }
        slotObj.el.ql.change(this.qlChange);
        slotObj.el.glyphQl.change(this.glyphChange);
        slotObj.el.primaryGlyph.change(this.glyphChange);
        slotObj.el.secondaryGlyph.change(this.glyphChange);
        slotObj.el.signetId.change(this.signetChange);
        slotObj.el.signetQuality.change(this.signetChange);
    };

    this.addSignetsToSelect = function() {
        slotObj.el.signetId.append($('<option>', {
            value: "none",
            text: "None",
            selected: "true"
        }));

        this.updateToDefaultSignet();

        var signetsInSlotGroup = $.merge([], tswcalc.data.signet_data[slot.group]);
        // weapon signets can also be slotted in head
        $.merge(signetsInSlotGroup, this.getSignetsForHead(slot.group));
        // merge in non-head and non-weapon signets in this slot
        $.merge(signetsInSlotGroup, this.getSignetsForSlot());

        signetsInSlotGroup.sort(function(a, b) {
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
                return 1;
            } else {
                return -1;
            }
        });
        $.each(signetsInSlotGroup, function(index, value) {
            slotObj.el.signetId.append($('<option>', {
                value: value.id,
                text: value.name
            }));
        });
    };

    this.updateToDefaultSignet = function() {
        var signet_icon_url = 'assets/images/icons/' + slot.group + '_dps.png';
        var signet_quality_url = 'assets/images/icons/normal.png';
        $('#' + slot.id_prefix + '-signet-img-icon').attr('src', signet_icon_url);
        $('#' + slot.id_prefix + '-signet-img-quality').attr('src', signet_quality_url);
    };

    this.getSignetsForHead = function(group) {
        if (group == 'head') {
            return tswcalc.data.signet_data['weapon'];
        }
        return [];
    };

    this.getSignetsForSlot = function() {
        if (slot.id_prefix !== 'head' && slot.id_prefix !== 'weapon' && typeof tswcalc.data.signet_data[slot.id_prefix] !== 'undefined') {
            return tswcalc.data.signet_data[slot.id_prefix];
        }
        return [];
    };

    this.signetChange = function(event) {
        var signet = slotObj.signet();

        if (typeof signet.requires !== 'undefined') {
            var cadoro = tswcalc.data.cadoro_items[signet.requires];
            var cadoroItem = cadoro[slot.id_prefix][slotObj.role()];
            if (cadoroItem !== undefined && cadoroItem.name !== '') {
                slotObj.name(': ' + cadoroItem.name);
            }
            slotObj.signetQuality('epic');
            slotObj.el.signetQuality.attr('disabled', 'disabled');
            slotObj.el.nameWarning.tooltip({
                title: cadoro.warning_text,
                placement: 'top'
            });
            slotObj.el.nameWarning.show();
        } else {
            if(!slotObj.isWeapon()) {
                slotObj.name('');
            }
            slotObj.el.signetQuality.removeAttr('disabled');
            slotObj.el.nameWarning.hide();
        }
        slotObj.updateSignet();
        tswcalc.summary.updateAllStats();
    };

    this.roleChange = function(event) {
        var role = $(this).val();
        if (tswcalc.data.ny_raid_items[slot.id_prefix][role] === undefined) {
            slotObj.el.btn.nyraid.attr('checked', false);
            slotObj.el.btn.nyraid.attr('disabled', 'disabled');
        } else {
            slotObj.el.btn.nyraid.removeAttr('disabled');
        }

        if (slotObj.el.btn.nyraid.is(':checked')) {
            tswcalc.checkbox[slot.id_prefix].changeToRaidItem();
        }

        if(slot.id_prefix == "neck") {
            if (tswcalc.data.woodcutters[slot.id_prefix][role] === undefined) {
                slotObj.el.btn.woodcutters.attr('checked', false);
                slotObj.el.btn.woodcutters.attr('disabled', 'disabled');
            } else {
                slotObj.el.btn.woodcutters.removeAttr('disabled');
            }

            if (slotObj.el.btn.woodcutters.is(':checked')) {
                tswcalc.checkbox[slot.id_prefix].changeToWoodcutters();
            }
        }

        if(!slotObj.el.btn.woodcutters.is(':checked') && !slotObj.el.btn.nyraid.is(':checked')) {
            tswcalc.checkbox[slot.id_prefix].changeToCustomItem();
        }

        tswcalc.summary.updateAllStats();
    };

    this.wtypeChange = function(event) {
        var wtype = $(this).val();

        if(wtype != 'none') {
            slotObj.name(': ' + tswcalc.util.capitalise(wtype));
        } else {
            slotObj.name('');
        }
    };

    this.qlChange = function(event) {
        tswcalc.summary.updateAllStats();
    };

    this.glyphChange = function(id_suffix) {
        self.updateGlyphDistributionButtons();
        tswcalc.summary.updateAllStats();
    };
    
    this.updateGlyphDistributionButtons = function() {
        if(slotObj.el.glyphQl.val() === "11.0") {
            slotObj.el.btn.primary[1].attr('disabled', 'disabled');
            slotObj.el.btn.primary[3].attr('disabled', 'disabled');
            slotObj.el.btn.secondary[1].attr('disabled', 'disabled');       
            slotObj.el.btn.secondary[3].attr('disabled', 'disabled');
            
            if(slotObj.primaryDist() == 1 || slotObj.primaryDist() == 3) {
                slotObj.el.btn.primary[4].trigger('click');
                slotObj.el.btn.secondary[0].trigger('click');
            }
        } else {
            slotObj.el.btn.primary[1].removeAttr('disabled');
            slotObj.el.btn.primary[3].removeAttr('disabled');
            slotObj.el.btn.secondary[1].removeAttr('disabled');
            slotObj.el.btn.secondary[3].removeAttr('disabled');
        }
    };
};