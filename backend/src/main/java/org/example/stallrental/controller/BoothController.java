package org.example.stallrental.controller;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.Booth;
import org.example.stallrental.service.BoothService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/booths")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class BoothController {
    private final BoothService boothService;

    @GetMapping
    public ResponseEntity<List<Booth>> getAll() {
        return ResponseEntity.ok(boothService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booth> getById(@PathVariable Long id) {
        return ResponseEntity.ok(boothService.getById(id));
    }

    @GetMapping("/area/{areaId}")
    public ResponseEntity<List<Booth>> getByAreaId(@PathVariable Long areaId) {
        return ResponseEntity.ok(boothService.getByAreaId(areaId));
    }

    @PostMapping
    public ResponseEntity<Booth> create(@RequestBody Booth booth) {
        return ResponseEntity.ok(boothService.save(booth));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booth> update(@PathVariable Long id, @RequestBody Booth booth) {
        booth.setId(id);
        return ResponseEntity.ok(boothService.save(booth));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boothService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
