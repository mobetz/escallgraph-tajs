function User(first, last){ 
  if ( !(this instanceof User) ) 
    return new User(first, last); 
   
  this.obj_name = first + " " + last;
} 
 
var name = "Resig"; 
var user = User("John", name); 
 
TAJS_assert( !! user );
TAJS_assert( name == "Resig" );
