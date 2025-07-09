<template>
  <aside class="sidebar">
    <router-link to="/" class="brand" style="text-decoration:none;">
      <i class="fa-solid fa-cubes"></i>
      <span style="font-family: 'DINAlternate', Arial, sans-serif;">SBM Manager</span>
    </router-link>
    <ul class="nav">
      <li>
        <router-link to="/" class="nav-link" active-class="active" exact>
          <i class="fa-solid fa-home"></i>Dashboard
        </router-link>
      </li>
      <li>
        <router-link to="/franquicias" class="nav-link" active-class="active">
          <i class="fa-solid fa-cubes"></i>Franquicias
        </router-link>
      </li>
      <li>
        <router-link to="/catalogos" class="nav-link" active-class="active">
          <i class="fa-solid fa-book"></i>Catálogos
        </router-link>
      </li>
      <li>
        <a href="#" class="nav-link"><i class="fa-solid fa-cog"></i>Configuración</a>
      </li>
    </ul>
    <div class="user">
      <a href="#" class="dropdown-toggle" data-bs-toggle="dropdown">
        <img src="https://ui-avatars.com/api/?name=SBM+User&background=23272b&color=fff" alt="user" />
        <span>Usuario</span>
      </a>
      <ul class="dropdown-menu dropdown-menu-dark">
        <li><a class="dropdown-item" href="#"><i class="fa-solid fa-user me-2"></i>Perfil</a></li>
        <li><a class="dropdown-item" href="#"><i class="fa-solid fa-right-from-bracket me-2"></i>Salir</a></li>
      </ul>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
};
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  position: relative;
  top: 0;
  left: 0;
  background: #ffffff; /* fondo claro */
  color: #212529;       /* texto oscuro */
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  box-shadow: 2px 0 8px #0002;
  font-family: Arial, sans-serif;
}
.brand {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  text-decoration: none;
  color: #e53935; /* rojo */
  font-size: 1.4rem;
  font-weight: bold;
}
.brand i {
  margin-right: 0.5rem;
}
.nav {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  display: block !important; /* Fuerza columna, ignora display:flex de Bootstrap */
}
.nav li {
  margin-bottom: 0.25rem;
}
.nav-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  color: #212529; /* texto oscuro */
  opacity: 0.85;
  transition: background 0.3s, opacity 0.3s, color 0.3s;
  font-family: 'DINAlternate', Arial, sans-serif;
  font-weight: bold;
}
.nav-link i {
  margin-right: 0.75rem;
  font-family: 'Font Awesome 6 Free' !important;
  font-weight: 900 !important;
}
.nav-link:hover {
  background: #f5f5f5; /* hover claro */
  opacity: 1;
  color: #e53935;     /* rojo al pasar */
}
.active {
  background: #e53935 !important; /* fondo activo rojo */
  color: #ffffff !important;      /* texto claro */
  opacity: 1;
}
.user {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}
.user a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #212529;
  font-family: 'DINAlternate', Arial, sans-serif;
}
.user img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 0.5rem;
  border: 1px solid #dee2e6;
}

</style>

