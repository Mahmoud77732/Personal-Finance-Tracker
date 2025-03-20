/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.personal.finance_tracker.dao;

import com.personal.finance_tracker.entity.Transaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

/**
 *
 * @author mahmoud
 */
@RepositoryRestResource(path = "transactions")
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    @RestResource(path = "byUser")
    List<Transaction> findByUserId(@Param("userId") Long userId);
    
}
