using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using RestSharp;
using System.Linq;

namespace restSharpTests
{
    public class TicketDevTests
    {
        private readonly string baseUrl = "https://ticketing.dev";
        private RestClient _client;
        [SetUp]
        public void Setup()
        {
            _client = new RestClient(baseUrl);
            _client.RemoteCertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) => true;
        }

        [TestCase(201), Timeout(8000)]
        public void CreateOrder_Created(int expectedstatusCode)
        {
            var ticketId = CreateTicket();
            var result = CreateOrder(ticketId);
            Assert.That(result.Length > 2);
        }

        [Ignore("")]
        [TestCase(201), Timeout(8000)]
        public void CreateTicket_Created(int expectedstatusCode)
        {
            var result = CreateTicket();
            Assert.That(result.Length > 2);
        }

        [Ignore("")]
        [TestCase(200), Timeout(8000)]
        public void Users_Test(int expectedstatusCode)
        {
            // Arrange
            var request = new RestRequest("/api/users/test", Method.GET);

            // Act
            var response = _client.ExecuteGetAsync(request).GetAwaiter().GetResult();

            // Assert
            Assert.That((int)response.StatusCode == expectedstatusCode);
            System.Console.WriteLine(response.ResponseUri);
            System.Console.WriteLine(response.StatusCode);
            System.Console.WriteLine(response.Content);
        }


        [Ignore("")]
        [TestCase(200), Timeout(8000)]
        public void Signin_OK(int expectedstatusCode)
        {
            Signin(_client, "test@email.com", "test");

            // send a request to verify
            var getCurrentUserRequest = new RestRequest("/api/users/currentuser", Method.GET);
            var responseGetCurrentUser = _client.ExecuteAsync(getCurrentUserRequest).GetAwaiter().GetResult();

            System.Console.WriteLine(responseGetCurrentUser.ResponseUri);
            var data = (JObject)JsonConvert.DeserializeObject(responseGetCurrentUser.Content);
            var email = data["currentUser"]["email"].Value<string>();
            Assert.That(email, Is.EqualTo("test@email.com"));
        }

        private string CreateOrder(string ticketIdStr)
        {
            try
            {
                var request = new RestRequest("/api/orders", Method.POST);
                request.AddJsonBody(new { ticketId = ticketIdStr });
                var response = _client.ExecuteAsync(request).GetAwaiter().GetResult();

                System.Console.WriteLine(response.ResponseUri);
                var data = (JObject)JsonConvert.DeserializeObject(response.Content);
                var id = data["id"].Value<string>();
                var status = data["status"].Value<string>();
                var version = data["version"].Value<string>();
                var TicketId = data["ticket"]["id"].Value<string>();
                System.Console.WriteLine($"Order created: \n");
                System.Console.WriteLine($"id: {id}\n");
                System.Console.WriteLine($"status: {status}\n");
                System.Console.WriteLine($"version: {version}\n");
                System.Console.WriteLine($"TicketId: {TicketId}\n");

                return id;

            }
            catch
            {
                return "";

            }

        }
        private string CreateTicket()
        {
            try
            {
                Signin(_client, "test@email.com", "test");
                var request = new RestRequest("/api/tickets", Method.POST);
                request.AddJsonBody(new { title = "the title of an event", price = 1.999 });
                var response = _client.ExecuteAsync(request).GetAwaiter().GetResult();

                System.Console.WriteLine(response.ResponseUri);
                var data = (JObject)JsonConvert.DeserializeObject(response.Content);
                var id = data["id"].Value<string>();
                var title = data["title"].Value<string>();
                var price = data["price"].Value<string>();
                var userId = data["userId"].Value<string>();
                var version = data["version"].Value<string>();
                System.Console.WriteLine($"Ticket created: \n");
                System.Console.WriteLine($"id: {id}\n");
                System.Console.WriteLine($"title: {title}\n");
                System.Console.WriteLine($"price: {price}\n");
                System.Console.WriteLine($"userId: {userId}\n");
                System.Console.WriteLine($"version: {version}\n");

                return id;

            }
            catch
            {
                return "";

            }

        }
        private void Signin(RestClient client, string emailStr, string passwordStr)
        {
            var request = new RestRequest("/api/users/signin", Method.POST);
            request.AddJsonBody(new { email = emailStr, password = passwordStr });
            var response = client.ExecuteAsync(request).GetAwaiter().GetResult();

            System.Console.WriteLine(response.ResponseUri);
            var data = (JObject)JsonConvert.DeserializeObject(response.Content);
            var email = data["user"]["email"].Value<string>();
            var userId = data["user"]["id"].Value<string>();
            System.Console.WriteLine($"{email} : {userId}");

            //Pick-Up login Cookie and setting it to Client Cookie Container
            client.CookieContainer = new System.Net.CookieContainer();
            var accessToken = response.Cookies.First(c => c.Name == "session");
            client.CookieContainer.Add(new System.Net.Cookie(accessToken.Name, accessToken.Value, accessToken.Path, accessToken.Domain));

            // send new request to verify
            var getCurrentUserRequest = new RestRequest("/api/users/currentuser", Method.GET);
            var responseGetCurrentUser = client.ExecuteAsync(getCurrentUserRequest).GetAwaiter().GetResult();

            System.Console.WriteLine(responseGetCurrentUser.ResponseUri);
            System.Console.WriteLine(responseGetCurrentUser.Content);
        }
    }
}
