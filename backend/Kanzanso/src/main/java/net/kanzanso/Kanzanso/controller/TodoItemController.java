package net.kanzanso.Kanzanso.controller;

import net.kanzanso.Kanzanso.dto.TodoItemDTO;
import net.kanzanso.Kanzanso.service.TodoItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/todos")
public class TodoItemController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(TodoItemController.class);
    private final TodoItemService todoItemService;

    @Autowired
    public TodoItemController(TodoItemService todoItemService) {
        this.todoItemService = todoItemService;
    }

    @PostMapping
    public ResponseEntity<TodoItemDTO> createTodoItem(@Valid @RequestBody TodoItemDTO todoItemDTO, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            logger.info("Creating todo item for user {}: {}", userId, todoItemDTO);
            TodoItemDTO createdTodoItem = todoItemService.createTodoItem(userId, todoItemDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTodoItem);
        } catch (IllegalArgumentException e) {
            logger.error("Error creating todo item: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error creating todo item", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        }
    }

    @GetMapping
    public ResponseEntity<List<TodoItemDTO>> getTodoItems(HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            logger.info("Getting todo items for user {}", userId);
            List<TodoItemDTO> todoItems = todoItemService.getTodoItemsByUserId(userId);
            return ResponseEntity.ok(todoItems);
        } catch (IllegalArgumentException e) {
            logger.error("Error getting todo items: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error getting todo items", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TodoItemDTO> getTodoItemById(@PathVariable String id, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            logger.info("Getting todo item {} for user {}", id, userId);
            TodoItemDTO todoItem = todoItemService.getTodoItemById(userId, id);
            return ResponseEntity.ok(todoItem);
        } catch (IllegalArgumentException e) {
            logger.error("Error getting todo item {}: {}", id, e.getMessage());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error getting todo item {}", id, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TodoItemDTO> updateTodoItem(@PathVariable String id, @Valid @RequestBody TodoItemDTO todoItemDTO, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            logger.info("Updating todo item {} for user {}: {}", id, userId, todoItemDTO);
            TodoItemDTO updatedTodoItem = todoItemService.updateTodoItem(userId, id, todoItemDTO);
            return ResponseEntity.ok(updatedTodoItem);
        } catch (IllegalArgumentException e) {
            logger.error("Error updating todo item {}: {}", id, e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error updating todo item {}", id, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodoItem(@PathVariable String id, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            logger.info("Deleting todo item {} for user {}", id, userId);
            todoItemService.deleteTodoItem(userId, id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.error("Error deleting todo item {}: {}", id, e.getMessage());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error deleting todo item {}", id, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        }
    }
}