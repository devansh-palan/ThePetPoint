import pool from './index';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Truncate existing data to start fresh
    await pool.query(`TRUNCATE TABLE users, pets, vendors, bookings, messages, events, event_rsvps, community_posts CASCADE;`);

    // 1. Create Users
    const passwordHash = await bcrypt.hash('password123', 10);
    
    console.log('Creating users...');
    const usersRes = await pool.query(`
      INSERT INTO users (username, name, email, password_hash, role, location)
      VALUES 
        ('admin_user', 'Admin User', 'admin@thepetpoint.ca', $1, 'admin', 'Toronto'),
        ('jane_doe', 'Jane Doe', 'jane@example.com', $1, 'user', 'Toronto'),
        ('grooming_pro', 'Grooming Pro', 'vendor1@example.com', $1, 'vendor', 'Toronto'),
        ('training_guru', 'Training Guru', 'vendor2@example.com', $1, 'vendor', 'Toronto'),
        ('vet_clinic', 'Dr. Smith', 'vendor3@example.com', $1, 'vendor', 'Toronto')
      RETURNING id, username;
    `, [passwordHash]);

    const users = usersRes.rows;
    const adminId = users.find((u: any) => u.username === 'admin_user').id;
    const userId = users.find((u: any) => u.username === 'jane_doe').id;
    const vendor1Id = users.find((u: any) => u.username === 'grooming_pro').id;
    const vendor2Id = users.find((u: any) => u.username === 'training_guru').id;
    const vendor3Id = users.find((u: any) => u.username === 'vet_clinic').id;

    // 2. Create Pets
    console.log('Creating pets...');
    const petsRes = await pool.query(`
      INSERT INTO pets (owner_id, name, breed, age, notes)
      VALUES
        ($1, 'Buddy', 'Golden Retriever', 3, 'Very friendly, loves balls.'),
        ($1, 'Luna', 'Siamese Cat', 2, 'A bit shy at first.')
      RETURNING id;
    `, [userId]);
    const buddyId = petsRes.rows[0].id;

    // 3. Create Vendors
    console.log('Creating vendors (10 per category)...');
    
    const categories: Record<string, string[]> = {
      grooming:   ['Bath', 'Haircut', 'Deshedding', 'Nail Trimming', 'Flea Treatment'],
      training:   ['Puppy Obedience', 'Behavior Modification', 'Agility Training', 'Private Lessons'],
      boarding:   ['Overnight Stay', 'Long-term Boarding', 'VIP Suites', 'Playtime Included'],
      veterinary: ['Checkups', 'Vaccinations', 'Dental Care', 'Surgery', 'Emergency Care'],
      daycare:    ['Full-day Play', 'Half-day Play', '1-on-1 Time', 'Puzzle Toys'],
      walking:    ['30m Walk', '1hr Walk', 'Group Hikes', 'Park Visits'],
      other:      ['Pet Photography', 'Pet Taxi', 'Nutrition Consulting', 'Custom Collars']
    };

    const adjectives = ['Happy', 'Cozy', 'Pawsome', 'Healthy', 'Downtown', 'Elite', 'Premier', 'Friendly', 'Local', 'Urban', 'Gentle', 'Pro'];
    const nouns = ['Paws', 'Tails', 'Pets', 'Dogs', 'Cats', 'Companions', 'Furriends', 'Retreat', 'Care', 'Services'];
    const ownerFirstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Oliver', 'Isabella', 'Elijah', 'Sophia', 'James'];
    const ownerLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    // Some general high quality unsplash pet photos
    const photoBank = [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800'
    ];

    let queryVals = [];
    let queryParams = [];
    let paramCount = 1;
    
    let dbVendorCounter = 0;
    for (const [category, availableServices] of Object.entries(categories)) {
      for (let i = 0; i < 10; i++) {
        dbVendorCounter++;
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const businessName = `${adj} ${noun} ${category.charAt(0).toUpperCase() + category.slice(1)}`;
        const ownerName = `${ownerFirstNames[Math.floor(Math.random() * ownerFirstNames.length)]} ${ownerLastNames[Math.floor(Math.random() * ownerLastNames.length)]}`;
        const email = `vendor_${category}_${i}@example.com`;
        
        // Pick 2-3 random services
        const shuffled = availableServices.sort(() => 0.5 - Math.random());
        const myServices = shuffled.slice(0, Math.floor(Math.random() * 2) + 2);
        
        const myPhotos = [photoBank[Math.floor(Math.random() * photoBank.length)]];
        const description = `Highly rated ${category} service providing excellent care. We offer ${myServices.join(' and ')} to keep your pets healthy and happy. Based in the heart of Toronto!`;
        const address = `${Math.floor(Math.random() * 900) + 10} ${['King', 'Queen', 'Dundas', 'Spadina', 'Yonge', 'Bathurst', 'College', 'Bloor'][Math.floor(Math.random()*8)]} St, Toronto`;
        
        const price = `$${Math.floor(Math.random() * 50) + 20} - $${Math.floor(Math.random() * 100) + 70}`;
        
        // Link the first few explicitly to our test vendor users so we can log into them
        let userIdVal = null;
        if (category === 'grooming' && i === 0) { userIdVal = vendor1Id; }
        else if (category === 'training' && i === 0) { userIdVal = vendor2Id; }
        else if (category === 'veterinary' && i === 0) { userIdVal = vendor3Id; }
        
        queryVals.push(`($${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++})`);
        queryParams.push(userIdVal, businessName, ownerName, email, category, description, myServices, address, true, price, myPhotos);
      }
    }

    const vendorsRes = await pool.query(`
      INSERT INTO vendors (user_id, business_name, owner_name, email, category, description, services, address, approved_status, price_range, photo_urls)
      VALUES ${queryVals.join(', ')}
      RETURNING id, category;
    `, queryParams);

    const groomingVendorId = vendorsRes.rows.find((v: any) => v.category === 'grooming').id;
    const trainingVendorId = vendorsRes.rows.find((v: any) => v.category === 'training').id;

    // 4. Create Events
    console.log('Creating events...');
    const eventsRes = await pool.query(`
      INSERT INTO events (title, location, date_time, description, created_by, rsvp_count, approved_status)
      VALUES
        ('Toronto Pet Expo 2026', 'Enercare Centre', NOW() + INTERVAL '14 days', 'The biggest pet expo in Canada! Bring your furry friends for a day full of fun, shopping, and networking.', $1, 1, true),
        ('Puppy Socialization Hour', 'Trinity Bellwoods Park', NOW() + INTERVAL '3 days', 'A relaxed meetup for puppies under 6 months old to socialize and play safely.', $1, 0, true),
        ('Dog First Aid Seminar', 'Community Center', NOW() + INTERVAL '30 days', 'Learn essential first aid skills for your dog in this hands-on workshop.', $1, 0, true)
      RETURNING id;
    `, [adminId]);
    const event1Id = eventsRes.rows[0].id;

    // 5. Create RSVPs
    await pool.query(`INSERT INTO event_rsvps (event_id, user_id) VALUES ($1, $2);`, [event1Id, userId]);

    // 6. Create Community Posts
    console.log('Creating posts...');
    await pool.query(`
      INSERT INTO community_posts (user_id, content)
      VALUES
        ($1, 'Just moved to Toronto with my Golden Retriever! Does anyone have recommendations for good dog parks near downtown?'),
        ($2, 'Welcome! Trinity Bellwoods is great, but it can get busy. Try Coronation Park as well, right by the water!'),
        ($3, 'Reminder: Tick season is starting early this year. Make sure your pets are protected!')
    `, [userId, vendor1Id, vendor3Id]);

    // 7. Create Bookings
    console.log('Creating bookings...');
    await pool.query(`
      INSERT INTO bookings (user_id, vendor_id, pet_id, requested_date, requested_time, message, status)
      VALUES
        ($1, $2, $3, CURRENT_DATE + INTERVAL '5 days', '10:00:00', 'Buddy needs a full groom!', 'confirmed'),
        ($1, $4, $3, CURRENT_DATE + INTERVAL '10 days', '14:00:00', 'Looking for obedience training.', 'pending')
    `, [userId, groomingVendorId, buddyId, trainingVendorId]);

    // 8. Create Messages
    console.log('Creating messages...');
    await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, vendor_id, message)
      VALUES
        ($1, $2, $3, 'Hi! I saw you have availability next week. Do you provide deshedding treatments for Golden Retrievers?'),
        ($2, $1, $3, 'Hello Jane! Yes, we definitely do. It is included in our premium groom package.')
    `, [userId, vendor1Id, groomingVendorId]);

    console.log('✅ Seeding complete!');
    console.log('\n=============================');
    console.log('🧪 TEST ACCOUNTS (Password: password123)');
    console.log('-----------------------------');
    console.log('👤 User:    jane@example.com');
    console.log('🏢 Vendor:  vendor1@example.com');
    console.log('🛡️ Admin:   admin@thepetpoint.ca');
    console.log('=============================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
