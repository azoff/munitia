(function(global, doc, load, munitia, $){ 
    
    function main() {
        munitia.session.start();
    }
    
    function loaded() {
        $(doc).ready(main);
    }
    
    load('/conf/'+doc.domain+'.js', loaded);
    
})(window, document, jQuery.getScript, munitia, jQuery);