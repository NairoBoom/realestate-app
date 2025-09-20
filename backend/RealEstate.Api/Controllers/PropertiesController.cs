using Microsoft.AspNetCore.Mvc;
using RealEstate.Api.Models;
using RealEstate.Application.Interfaces;
using RealEstate.Domain.DTOs;

namespace RealEstate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PropertiesController : ControllerBase
{
    private readonly IPropertyService _service;
    public PropertiesController(IPropertyService service) => _service = service;

    /// <summary>
    /// Lista propiedades con filtros (name, address, minPrice, maxPrice) + paginado + orden.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get([FromQuery] FilterRequest req)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var filter = new PropertyFilter(
            req.Name, req.Address, req.MinPrice, req.MaxPrice,
            req.Page, req.PageSize, req.SortBy, req.SortDir
        );

        var (items, total, page, size) = await _service.SearchAsync(filter);
        return Ok(new { total, page, pageSize = size, items });
    }

    /// <summary>
    /// Devuelve el detalle de una propiedad por IdProperty.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PropertyDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null ? NotFound() : Ok(item);
    }
}
