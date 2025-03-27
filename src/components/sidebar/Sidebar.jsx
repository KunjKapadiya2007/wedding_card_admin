import React, { useState } from "react";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import CategoryIcon from '@mui/icons-material/Category';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import Person4Icon from '@mui/icons-material/Person4';
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import { Box, Typography, Collapse } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MessageIcon from '@mui/icons-material/Message';
import { useNavigate } from "react-router-dom";

const Sidebar = ({
  open,
  handleDrawerClose,
  mobileOpen,
  handleDrawerTransitionEnd,
  setOpen,
  handleDrawerToggle,
}) => {
  const drawerWidth = 270;
  const [css, setCss] = useState("");
  const [subCss, setSubCss] = useState("");
  const [openSubmenu, setOpenSubmenu] = useState({});
  const navigate = useNavigate()

  const menuItems = [
    { text: "Template", icon: <AddIcon />, path: "/template" },
    { text: "Parent Category", icon: <FilterListIcon />, path: "/parent-category" },
    { text: "Category", icon: <CategoryIcon />, path: "/category" },
    { text: "Subcategory", icon: <BakeryDiningIcon />, path: "/subcategory" },
    { text: "Type", icon: <CardGiftcardIcon />, path: "/type" },
    { text: "Inquiry", icon: <MessageIcon />, path: "/inquiry" },
    { text: "Blog", icon: <MessageIcon />, path: "/blog" },
    { text: "Users", icon: <Person4Icon />, path: "/user" },
  ];

  const handleSubmenuClick = (text) => {
    setOpenSubmenu((prevOpenSubmenu) => ({
      ...prevOpenSubmenu,
      [text]: !prevOpenSubmenu[text],
    }));
  };

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    ...theme.mixins.toolbar,
    justifyContent: "end",
    backgroundColor: theme.palette.darkBlue,
    color: theme.palette.textGray,
  }));

  const theme = useTheme();

  const drawer = (
    <Box>
      <List
        sx={{
          color: theme.palette?.textGray || "#ecf0f1",
          height: "100%",
          px: "15px",
        }}
      >
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem
              disablePadding
              sx={{
                py: "2px",
                borderRadius: 1,
                transition: ".3s",
                "&:hover": {
                  backgroundColor: theme.palette?.sidebarHover || "#000",
                  color: "white",
                  "& .icon": { color: "white" },
                },
              }}
            >
              <ListItemButton
                onClick={() => item.submenu && handleSubmenuClick(item.text)}
              >
                <ListItemIcon
                  className="icon"
                  sx={{ color: theme.palette?.textGray || "#ecf0f1" }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {item.submenu ? (
                  openSubmenu[item.text] ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )
                ) : null}
              </ListItemButton>
            </ListItem>

            {item.submenu && (
              <Collapse
                in={openSubmenu[item.text]}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.submenu.map((subItem) => (
                    <ListItem
                      key={subItem.text}
                      disablePadding
                      sx={{
                        py: "2px",
                        pl: 4,
                        borderRadius: 1,
                        transition: ".3s",
                        "&:hover": {
                          backgroundColor:
                            theme.palette?.sidebarHover || "#000",
                          color: "white",
                          "& .icon": { color: "white" },
                        },
                      }}
                    >
                      <ListItemButton>
                        <ListItemIcon
                          className="icon"
                          sx={{ color: theme.palette?.textGray || "#ecf0f1" }}
                        >
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText primary={subItem.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
  return (
    <Box>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            backgroundColor: theme.palette.darkBlue,
            color: theme.palette.textGray,
          },
        }}
      >
        <DrawerHeader>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { xs: "none", md: "block" },
              height: "50px",
              width: "50px",
              "&:hover": { backgroundColor: theme.palette.sidebarHover },
            }}
          >
            <MenuIcon />
          </IconButton>
        </DrawerHeader>
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              my: "5px",
            }}
          >
            <Box
              sx={{
                height: "130px",
                width: "130px",
                borderRadius: "50%",
                overflow: "hidden",
              }}
            >
              <img
                src="https://platform.vox.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/8232671/bossbabycover.jpg?quality=90&strip=all&crop=11.206896551724%2C0%2C77.586206896552%2C100&w=1080"
                alt="logo" width={'100%'}
              />
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
              mb: "25px",
            }}
          >
            <Typography sx={{ color: "#000" }}>Jhon Doe</Typography>

            <Box>
              <Typography sx={{ fontSize: "14px" }}>
                jhondoe90@gmail.com
              </Typography>
            </Box>
          </Box>
        </Box>
        {drawer}
      </Drawer>

      <Drawer
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: theme.palette?.darkBlue || "#fff",
            color: theme.palette?.textGray || "#000",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        {/* <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: theme.spacing(2) || 2,
          }}
        >
          <IconButton onClick={() => setOpen(!open)}>
            <MenuIcon sx={{ color: "textGray" }} />
          </IconButton>
        </Box> */}

        <Divider />

        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              my: "5px",
              mt: "50px",
            }}
          >
            <Box
              sx={{
                height: "130px",
                width: "130px",
                borderRadius: "50%",
                overflow: "hidden",
              }}
            >
              <img
                src="https://platform.vox.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/8232671/bossbabycover.jpg?quality=90&strip=all&crop=11.206896551724%2C0%2C77.586206896552%2C100&w=1080"
                alt="logo"
              />
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
              mb: "25px",
            }}
          >
            <Typography sx={{ color: "#000" }}>Jhon Doe</Typography>

            <Box>
              <Typography sx={{ fontSize: "14px" }}>
                jhondoe90@gmail.com
              </Typography>
            </Box>
          </Box>
        </Box>

        <List
          sx={{
            color: theme.palette?.textGray || "#000",
            height: "100%",
            px: "15px",
          }}
        >
          {menuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem
                onClick={() => {
                  setCss(item.text);
                  setSubCss("");
                  navigate(`${item.path}`)
                }}
                disablePadding
                sx={{
                  py: "2px",
                  borderRadius: 1,
                  transition: ".3s",
                  backgroundColor:
                    css === item.text &&
                    (theme.palette?.sidebarHover || "#000"),
                  color: css === item.text && "white",
                  "&:hover": {
                    backgroundColor: theme.palette?.sidebarHover || "#000",
                    color: "white",
                    "& .icon": { color: "white" },
                  },
                }}
              >
                <ListItemButton
                  onClick={() => item.submenu && handleSubmenuClick(item.text)}
                >
                  <ListItemIcon
                    className="icon"
                    sx={{
                      color:
                        css === item.text
                          ? "#fff"
                          : theme.palette?.textGray || "#000",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                  {item.submenu ? (
                    openSubmenu[item.text] ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )
                  ) : null}
                </ListItemButton>
              </ListItem>

              {item.submenu && (
                <Collapse
                  in={openSubmenu[item.text]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.submenu.map((subItem) => (
                      <ListItem
                        onClick={() => setSubCss(subItem.text)}
                        key={subItem.text}
                        disablePadding
                        sx={{
                          py: "2px",
                          pl: 4,
                          borderRadius: 1,
                          transition: ".3s",
                          backgroundColor:
                            subCss === subItem.text &&
                            (theme.palette?.sidebarHover || "#000"),
                          color: subCss === subItem.text && "#000",
                          "&:hover": {
                            backgroundColor:
                              theme.palette?.sidebarHover || "#000",
                            color: "white",
                            "& .icon": { color: "#fff" },
                          },
                        }}
                      >
                        <ListItemButton>
                          <ListItemIcon
                            className="icon"
                            sx={{
                              color:
                                subCss === subItem.text
                                  ? "#000"
                                  : theme.palette?.textGray || "#ecf0f1",
                            }}
                          >
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText primary={subItem.text} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
        <Divider />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
