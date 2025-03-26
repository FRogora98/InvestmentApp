using Microsoft.AspNetCore.Mvc;
using expense_tracker_backend.Interfaces;
using expense_tracker_backend.Models;

namespace expense_tracker_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepository _repository;

        public CategoriesController(ICategoryRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            var categories = await _repository.GetAllAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _repository.GetByIdAsync(id);
            
            if (category == null)
            {
                return NotFound();
            }
            
            return category;
        }

        [HttpPost]
        public async Task<ActionResult<Category>> PostCategory(Category category)
        {
            var createdCategory = await _repository.CreateAsync(category);
            
            return CreatedAtAction(
                nameof(GetCategory),
                new { id = createdCategory.Id },
                createdCategory);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, Category category)
        {
            if (id != category.Id)
            {
                return BadRequest();
            }
            
            await _repository.UpdateAsync(category);
            
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            await _repository.DeleteAsync(id);
            
            return NoContent();
        }
    }
}