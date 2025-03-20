/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.personal.finance_tracker.config;

import com.personal.finance_tracker.entity.Budget;
import com.personal.finance_tracker.entity.Category;
import com.personal.finance_tracker.entity.Transaction;
import com.personal.finance_tracker.entity.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.metamodel.EntityType;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

/**
 *
 * @author mahmoud
 */
@Configuration
public class MyDataRestConfig implements RepositoryRestConfigurer {
    
    private EntityManager entityManager;
    @Value("${allowed.origins}") // Default to localhost:4200 if not set
    private String[] allowedOrigins;

    @Value("${spring.data.rest.base-path}")
    private String basePath;
    
    
    @Autowired
    public MyDataRestConfig(EntityManager entityManager) {
        this.entityManager = entityManager;
    }
    
    /**
     * Read Only approach
     *
     * @param config
     * @param cors
     */
    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
        HttpMethod[] theUnSupportedActions = {HttpMethod.PUT, HttpMethod.DELETE};
        
        // disable HTTP methods for Entity Classes: PUT, POST and DELETE
        disableHttpMethods(User.class, config, theUnSupportedActions);
        disableHttpMethods(Transaction.class, config, theUnSupportedActions);
        disableHttpMethods(Budget.class, config, theUnSupportedActions);
        disableHttpMethods(Category.class, config, theUnSupportedActions);

        // call an internal helper method
        exposeIds(config);
        
        // Now: we can remove @CrossOrigin from JpaRepositries
        //cors.addMapping("/api/**").allowedOrigins("http://localhost:4200");
        //cors.addMapping("/api/**").allowedOrigins(allowedOrigins);
        cors.addMapping(config.getBasePath()+ "/**").allowedOrigins(allowedOrigins);
    }

    private void disableHttpMethods(Class theEntityClass, RepositoryRestConfiguration config, HttpMethod[] theUnSupportedActions) {
        config.getExposureConfiguration()
                .forDomainType(theEntityClass)
                .withItemExposure((metadata, httpMethods) -> httpMethods.disable(theUnSupportedActions))
                .withCollectionExposure((metadata, httpMethods) -> httpMethods.disable(theUnSupportedActions));
    }

    // developed method to expose the IDs
    // spring-data-rest don't expose IDs for objs by default
    private void exposeIds(RepositoryRestConfiguration config) {
        // expose entity IDs

        // get a list of all entity classes from the entity manager
        Set<EntityType<?>> entities = entityManager.getMetamodel().getEntities();

        // create an array of the entity types
        List<Class> entityClasses = new ArrayList<>();

        // get the entity types for the entities
        for (EntityType tempEntityType : entities) {
            entityClasses.add(tempEntityType.getJavaType());
        }

        // expose the entity IDs for the array of entity/domain types
        Class[] domainTypes = entityClasses.toArray(new Class[0]);
        config.exposeIdsFor(domainTypes);
    }
    
}
