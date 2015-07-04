policy "quake2-1.0" do
    
  users  = role "client", "users"
  admins = role "client", "admins"
  
  resource "webservice", "server" do
    permit "connect", users
    permit "rcon", admins
  end
end
