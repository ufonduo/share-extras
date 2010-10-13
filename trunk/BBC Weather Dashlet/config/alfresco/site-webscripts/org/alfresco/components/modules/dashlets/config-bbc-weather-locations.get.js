function main()
{
   var s = new XML(config.script), matches = [];
   for each (place in s.places.place.(@name.indexOf(args.query)==0)) // List of places matching the query term
   {
      matches.push({
         "id" : parseInt(place.@location.toString()),
         "name" : place.@name.toString(),
         "display" : place.@display == null ? place.@name.toString() : place.@display.toString()
      });
   }
   model.matches = matches;
}

main();