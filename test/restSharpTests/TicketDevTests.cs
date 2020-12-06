using Newtonsoft.Json;
using NUnit.Framework;
using RestSharp;
using System.Collections.Generic;

namespace restSharpTests
{
    public class TicketDevTests
    {
        private readonly string baseUrl = "https://ticketing.dev/";
        private RestClient _client;
        [SetUp]
        public void Setup()
        {
            _client = new RestClient(baseUrl);
            _client.RemoteCertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) => true;
            //ServicePointManager.ServerCertificateValidationCallback +=
            //(sender, certificate, chain, sslPolicyErrors) => true;
            //
        }

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
            var json = response.Content;
            var obj = JsonConvert.DeserializeObject<Dictionary<string, string>>(json);
            System.Console.WriteLine(obj["message"]);
        }

        [TestCase(200), Timeout(8000)]
        public void Users_Signin(int expectedstatusCode)
        {
            // Arrange
            var request = new RestRequest("/api/users/signin", Method.POST);
            request.AddJsonBody(new { email = "email@email.com", password = "123" });
            // Act
            var response = _client.ExecuteAsync(request).GetAwaiter().GetResult();

            // Assert
            Assert.That((int)response.StatusCode == expectedstatusCode);
            System.Console.WriteLine(response.ResponseUri);
            System.Console.WriteLine(response.StatusCode);
            System.Console.WriteLine(response.Content);
            var json = response.Content;
        }

    }
}
