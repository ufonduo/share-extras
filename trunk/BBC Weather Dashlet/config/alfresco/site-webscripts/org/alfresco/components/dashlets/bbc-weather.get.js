function main()
{
    var s = new XML(config.script);
    var defaultLocation = parseInt(s.defaultLoc, 8); // London by default
    model.defaultLocation = defaultLocation;
}

main();