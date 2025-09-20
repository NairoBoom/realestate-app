using NUnit.Framework;

namespace RealEstate.Tests.Unit
{
    public class PropertyRepositoryContractTests
    {
        [Test]
        public void Search_ByName_FiltersCorrectly()
        {
            var repo = new InMemoryPropertyRepository();

            var (items, total) = repo
                .SearchAsync("casa", null, null, null, "price", true)
                .GetAwaiter().GetResult();

            Assert.That(total, Is.EqualTo(1));
            Assert.That(items[0].Name.ToLower(), Does.Contain("casa"));
        }

        [Test]
        public void Search_ByPriceRange_And_Sort_Desc()
        {
            var repo = new InMemoryPropertyRepository();

            var (items, total) = repo
                .SearchAsync(null, null, 350_000_000, 900_000_000, "price", true)
                .GetAwaiter().GetResult();

            Assert.That(total, Is.EqualTo(2));        
            Assert.That(items[0].Price, Is.GreaterThanOrEqualTo(items[1].Price)); // orden desc
        }
    }
}
