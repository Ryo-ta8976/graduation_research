import socket               # Import socket module

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)         # Create a socket object
#host = socket.gethostname() # Get local machine name
port = 12345                 # Reserve a port for your service.
print ('S')
s.connect(("192.168.50.236",  12345))
print ('S')
s.send("Hello server!")
print ('S')
f = open('sample.png','rb')
print ('Sending...')
l = f.read(1024)
while (l):
    print ('Sending...')
    s.send(l)
    l = f.read(1024)
f.close()
print ("Done Sending")
s.shutdown(socket.SHUT_WR)
print (s.recv(1024))
s.close                     # Close the socket when done
