function main()
{
    var s = new XML(config.script);
    var defaultLocation = parseInt(s.defaultLoc.toString()); // London by default
    model.defaultLocation = defaultLocation;
}

main();