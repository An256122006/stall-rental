package org.example.stallrental.controller;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.Area;
import org.example.stallrental.service.AreaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/areas")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AreaController {
    private final AreaService areaService;

    @GetMapping
    public ResponseEntity<List<Area>> getAll() {
        return ResponseEntity.ok(areaService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Area> getById(@PathVariable Long id) {
        return ResponseEntity.ok(areaService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Area> create(@RequestBody Area area) {
        return ResponseEntity.ok(areaService.save(area));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Area> update(@PathVariable Long id, @RequestBody Area area) {
        area.setId(id);
        return ResponseEntity.ok(areaService.save(area));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        areaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
