/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.personal.finance_tracker.dao;

import com.personal.finance_tracker.entity.Transaction;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
    
    @RestResource(path = "searchByType")
    Page<Transaction> findByTypeContainingIgnoreCase(String type, Pageable pageable);
    
    Page<Transaction> findAll(Pageable pageable);
    
    @RestResource(path = "searchByAmount")
    Page<Transaction> findByAmount(@Param("amount") Double amount, Pageable pageable);

    // Combined search (optional, for flexibility)
    @RestResource(path = "searchByTypeOrAmount")
    @Query("SELECT t FROM Transaction t WHERE (:type IS NULL OR LOWER(t.type) LIKE LOWER(CONCAT('%', :type, '%'))) AND (:amount IS NULL OR t.amount = :amount)")
    Page<Transaction> findByTypeContainingIgnoreCaseOrAmount(
    @Param("type") String type, 
    @Param("amount") Double amount, 
    Pageable pageable);
    
   
    
}
