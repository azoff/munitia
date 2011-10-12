(function(global, doc, load, munitia, $){ 
    
    function main() {
        $(doc).ready(munitia.session.start);
    }
    
    load('/conf/'+doc.domain+'.js', main);
    
})(window, document, jQuery.getScript, munitia, jQuery);