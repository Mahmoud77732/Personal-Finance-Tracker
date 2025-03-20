/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.personal.finance_tracker.bootstrap;

import com.personal.finance_tracker.dao.CategoryRepository;
import com.personal.finance_tracker.entity.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 *
 * @author mahmoud
 */
@Component
public class DataLoader implements CommandLineRunner {
    
    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            categoryRepository.save(new Category("Food"));
            categoryRepository.save(new Category("Rent"));
            categoryRepository.save(new Category("Income"));
            categoryRepository.save(new Category("Bills"));
        }
    }
}
